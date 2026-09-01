"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { assertStageUnlocked } from "@/lib/stage";
import { scoreCourse } from "@/lib/matching";
import type { JourneyStage } from "@/generated/prisma/enums";

/* ---------- tasks / checklist ---------- */

export async function toggleTask(taskId: string) {
  const user = await requireUser();
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.userId !== user.id) throw new Error("Not your task.");

  await assertStageUnlocked(user.id, task.stage);
  await prisma.task.update({ where: { id: taskId }, data: { done: !task.done } });

  revalidatePath("/journey");
  revalidatePath("/checklist");
  revalidatePath("/");
}

export async function updateTaskNote(taskId: string, note: string) {
  const user = await requireUser();
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.userId !== user.id) throw new Error("Not your task.");

  await prisma.task.update({ where: { id: taskId }, data: { note: note.trim() || null } });
  revalidatePath("/checklist");
  revalidatePath("/journey");
}

export async function addTask(stage: JourneyStage, label: string) {
  const user = await requireUser();
  await assertStageUnlocked(user.id, stage);
  await prisma.task.create({ data: { userId: user.id, stage, label: label.trim() || "New task" } });
  revalidatePath("/journey");
  revalidatePath("/checklist");
}

/* ---------- applications / shortlist ---------- */

export async function addToShortlist(courseId: string) {
  const user = await requireUser();
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: courseId },
    include: { university: true },
  });
  const matchScore = scoreCourse(user, course);

  await prisma.application.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: {},
    create: { userId: user.id, courseId, matchScore, status: "SHORTLISTED" },
  });
  revalidatePath("/universities");
  revalidatePath("/");
  revalidatePath("/journey");
}

export async function submitApplication(applicationId: string) {
  const user = await requireUser();
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  if (application.userId !== user.id) throw new Error("Not your application.");

  await assertStageUnlocked(user.id, "APPLICATIONS");
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "APPLIED", appliedAt: new Date() },
  });
  revalidatePath("/journey");
  revalidatePath("/");
}

/* ---------- quiz / onboarding ---------- */

const quizSchema = z.object({
  courseInterest: z.string().min(1),
  preferredCities: z.array(z.string()).default([]),
  budgetRange: z.string().min(1),
  qualification: z.enum(["TWELFTH_GRADE", "BACHELORS", "MASTERS"]),
  percentage: z.string().min(1),
  englishTest: z.string().optional(),
  englishScore: z.string().optional(),
});

export async function submitQuiz(raw: z.infer<typeof quizSchema>) {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in.");
  const data = quizSchema.parse(raw);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      courseInterest: data.courseInterest,
      preferredCities: data.preferredCities.join(","),
      budgetRange: data.budgetRange,
      qualification: data.qualification,
      percentage: data.percentage,
      englishTest: data.englishTest || null,
      englishScore: data.englishScore || null,
      onboarded: true,
    },
  });

  // real matching: score every course in the catalogue, shortlist the top 3
  const courses = await prisma.course.findMany({ include: { university: true } });
  const ranked = courses
    .map((c) => ({ course: c, score: scoreCourse(user, c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  for (const { course, score } of ranked) {
    await prisma.application.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: { matchScore: score },
      create: { userId: user.id, courseId: course.id, matchScore: score, status: "SHORTLISTED" },
    });
  }

  await prisma.task.createMany({
    data: [
      { userId: user.id, stage: "SHORTLIST", label: "Review your matched shortlist", done: false },
      { userId: user.id, stage: "SHORTLIST", label: "Confirm your shortlist with an advisor", done: false },
    ],
  });

  return { ok: true };
}

/* ---------- profile ---------- */

const profileSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  homeCity: z.string().optional(),
  qualification: z.enum(["TWELFTH_GRADE", "BACHELORS", "MASTERS"]).optional(),
  percentage: z.string().optional(),
  englishTest: z.string().optional(),
  englishScore: z.string().optional(),
  courseInterest: z.string().optional(),
  budgetRange: z.string().optional(),
});

export async function updateProfile(raw: z.infer<typeof profileSchema>) {
  const user = await requireUser();
  const data = profileSchema.parse(raw);
  try {
    await prisma.user.update({ where: { id: user.id }, data });
  } catch (err: unknown) {
    // Prisma P2002 = unique constraint violation (phone is unique across
    // users) — surface a real message instead of a raw 500.
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return { ok: false, error: "That phone number is already in use on another account." };
    }
    throw err;
  }
  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true };
}

/* ---------- service partner click-through tracking ---------- */

export async function logPartnerClick(partnerId: string) {
  const user = await requireUser();
  await prisma.partnerClick.create({ data: { partnerId, userId: user.id } });
}

/* ---------- messaging ---------- */

export async function sendMessage(threadId: string, body: string) {
  const user = await requireUser();
  const thread = await prisma.messageThread.findUniqueOrThrow({ where: { id: threadId } });
  if (thread.userId !== user.id) throw new Error("Not your thread.");
  if (!body.trim()) return;

  await prisma.message.create({ data: { threadId, fromUserId: user.id, body: body.trim() } });
  revalidatePath("/messages");
}

/* ---------- notifications ---------- */

export async function markNotificationRead(id: string) {
  const user = await requireUser();
  const notif = await prisma.notification.findUniqueOrThrow({ where: { id } });
  if (notif.userId !== user.id) throw new Error("Not your notification.");
  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  revalidatePath("/");
}
