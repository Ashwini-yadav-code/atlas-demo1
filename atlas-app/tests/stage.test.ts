import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { assertStageUnlocked, computeUnlockedStages, StageLockedError, STAGE_ORDER } from "@/lib/stage";

/** Real Prisma against the throwaway sqlite db from tests/global-setup.ts —
 * this is the single most safety-critical piece of business logic in the
 * app (checklist §3: "visa unlocks only after offer accepted"), so it gets
 * tested against a real database, not a mocked one. */

let universityId: string;
let courseId: string;

async function makeUser() {
  const user = await prisma.user.create({ data: { email: `stage-test-${Date.now()}-${Math.random()}@test.dev` } });
  return user.id;
}

beforeEach(async () => {
  const university = await prisma.university.create({
    data: { slug: `test-uni-${Date.now()}-${Math.random()}`, name: "Test University", city: "Manchester" },
  });
  universityId = university.id;
  const course = await prisma.course.create({
    data: {
      universityId,
      name: "MSc Testing",
      level: "MSc",
      tuitionPerYear: 20000,
      startDate: "2026-09",
      applicationDeadline: new Date("2026-06-01"),
      entryRequirement: "2:1 Hons",
      ieltsRequirement: "6.5",
    },
  });
  courseId = course.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("STAGE_ORDER", () => {
  it("starts at SHORTLIST and ends at ARRIVAL", () => {
    expect(STAGE_ORDER[0]).toBe("SHORTLIST");
    expect(STAGE_ORDER[STAGE_ORDER.length - 1]).toBe("ARRIVAL");
    expect(STAGE_ORDER).toHaveLength(5);
  });
});

describe("computeUnlockedStages", () => {
  it("a brand-new user only has SHORTLIST unlocked", async () => {
    const userId = await makeUser();
    const unlocked = await computeUnlockedStages(userId);
    expect(unlocked).toEqual(new Set(["SHORTLIST"]));
  });

  it("unlocks APPLICATIONS as soon as any application exists, regardless of status", async () => {
    const userId = await makeUser();
    await prisma.application.create({ data: { userId, courseId, matchScore: 80, status: "SHORTLISTED" } });
    const unlocked = await computeUnlockedStages(userId);
    expect(unlocked.has("APPLICATIONS")).toBe(true);
    expect(unlocked.has("VISA_DOCS")).toBe(false);
  });

  it("does NOT unlock VISA_DOCS on a merely-applied application (no accepted offer)", async () => {
    const userId = await makeUser();
    await prisma.application.create({ data: { userId, courseId, matchScore: 80, status: "APPLIED" } });
    const unlocked = await computeUnlockedStages(userId);
    expect(unlocked.has("VISA_DOCS")).toBe(false);
  });

  it("unlocks VISA_DOCS once an application is ACCEPTED", async () => {
    const userId = await makeUser();
    await prisma.application.create({ data: { userId, courseId, matchScore: 80, status: "ACCEPTED" } });
    const unlocked = await computeUnlockedStages(userId);
    expect(unlocked.has("VISA_DOCS")).toBe(true);
    expect(unlocked.has("PRE_DEPARTURE")).toBe(false);
  });

  it("does NOT unlock PRE_DEPARTURE while visa tasks are incomplete", async () => {
    const userId = await makeUser();
    await prisma.application.create({ data: { userId, courseId, matchScore: 80, status: "ACCEPTED" } });
    await prisma.task.create({ data: { userId, stage: "VISA_DOCS", label: "Book biometrics", done: false } });
    await prisma.task.create({ data: { userId, stage: "VISA_DOCS", label: "Upload passport", done: true } });
    const unlocked = await computeUnlockedStages(userId);
    expect(unlocked.has("PRE_DEPARTURE")).toBe(false);
  });

  it("unlocks PRE_DEPARTURE once every visa task is done", async () => {
    const userId = await makeUser();
    await prisma.application.create({ data: { userId, courseId, matchScore: 80, status: "ACCEPTED" } });
    await prisma.task.create({ data: { userId, stage: "VISA_DOCS", label: "Book biometrics", done: true } });
    await prisma.task.create({ data: { userId, stage: "VISA_DOCS", label: "Upload passport", done: true } });
    const unlocked = await computeUnlockedStages(userId);
    expect(unlocked.has("PRE_DEPARTURE")).toBe(true);
  });

  it("does NOT unlock PRE_DEPARTURE off zero visa tasks even with an accepted offer (no vacuous 'every task done')", async () => {
    const userId = await makeUser();
    await prisma.application.create({ data: { userId, courseId, matchScore: 80, status: "ACCEPTED" } });
    // deliberately no Task rows created at all
    const unlocked = await computeUnlockedStages(userId);
    expect(unlocked.has("PRE_DEPARTURE")).toBe(false);
  });

  it("never auto-unlocks ARRIVAL (not modeled by this engine)", async () => {
    const userId = await makeUser();
    await prisma.application.create({ data: { userId, courseId, matchScore: 80, status: "ACCEPTED" } });
    await prisma.task.create({ data: { userId, stage: "VISA_DOCS", label: "Book biometrics", done: true } });
    const unlocked = await computeUnlockedStages(userId);
    expect(unlocked.has("ARRIVAL")).toBe(false);
  });
});

describe("assertStageUnlocked", () => {
  it("resolves silently for an unlocked stage", async () => {
    const userId = await makeUser();
    await expect(assertStageUnlocked(userId, "SHORTLIST")).resolves.toBeUndefined();
  });

  it("throws StageLockedError for a locked stage — this is the actual server-side gate", async () => {
    const userId = await makeUser();
    await expect(assertStageUnlocked(userId, "VISA_DOCS")).rejects.toThrow(StageLockedError);
  });

  it("cannot be bypassed by an application that exists for a DIFFERENT user", async () => {
    const lockedUser = await makeUser();
    const otherUser = await makeUser();
    await prisma.application.create({ data: { userId: otherUser, courseId, matchScore: 80, status: "ACCEPTED" } });
    await expect(assertStageUnlocked(lockedUser, "VISA_DOCS")).rejects.toThrow(StageLockedError);
  });
});
