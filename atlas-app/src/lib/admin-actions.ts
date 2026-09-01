"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

/* ---------- catalogue editor ---------- */

const courseSchema = z.object({
  universityName: z.string().min(1),
  city: z.string().min(1),
  courseName: z.string().min(1),
  tuitionPerYear: z.coerce.number().positive(),
  applicationDeadline: z.string().min(1),
  entryRequirement: z.string().min(1),
  ieltsRequirement: z.string().min(1),
});

export async function createCourse(raw: z.infer<typeof courseSchema>) {
  await requireAdmin();
  const data = courseSchema.parse(raw);
  const slug = data.universityName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const university = await prisma.university.upsert({
    where: { slug },
    update: {},
    create: { slug, name: data.universityName, city: data.city },
  });
  await prisma.course.create({
    data: {
      universityId: university.id,
      name: data.courseName,
      level: "MSc",
      tuitionPerYear: data.tuitionPerYear,
      startDate: "Sept 2026",
      applicationDeadline: new Date(data.applicationDeadline),
      entryRequirement: data.entryRequirement,
      ieltsRequirement: data.ieltsRequirement,
    },
  });
  revalidatePath("/admin/universities");
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  await prisma.course.delete({ where: { id } });
  revalidatePath("/admin/universities");
}

/* ---------- service partner management ---------- */

export async function togglePartnerPriority(id: string) {
  await requireAdmin();
  const partner = await prisma.servicePartner.findUniqueOrThrow({ where: { id } });
  await prisma.servicePartner.update({ where: { id }, data: { isPriority: !partner.isPriority } });
  revalidatePath("/admin/services");
}

export async function deletePartner(id: string) {
  await requireAdmin();
  await prisma.servicePartner.delete({ where: { id } });
  revalidatePath("/admin/services");
}

/* ---------- community content publishing ---------- */

export async function toggleContentStatus(id: string) {
  await requireAdmin();
  const item = await prisma.communityContent.findUniqueOrThrow({ where: { id } });
  await prisma.communityContent.update({
    where: { id },
    data: { status: item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
  });
  revalidatePath("/admin/community");
}
