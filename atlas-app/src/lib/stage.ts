import { prisma } from "@/lib/prisma";
import type { JourneyStage } from "@/generated/prisma/enums";

/**
 * Stage-unlock rules, computed server-side from real data — not a CSS class
 * on a stepper. Checklist §3: "Stage engine — encodes the rule 'visa
 * unlocks only after offer accepted,' etc., server-side." Every mutation
 * that touches a gated stage (see actions.ts) calls assertStageUnlocked()
 * before writing, so this can't be bypassed by editing the client.
 */
export const STAGE_ORDER: JourneyStage[] = [
  "SHORTLIST",
  "APPLICATIONS",
  "VISA_DOCS",
  "PRE_DEPARTURE",
  "ARRIVAL",
];

export async function computeUnlockedStages(userId: string): Promise<Set<JourneyStage>> {
  const unlocked = new Set<JourneyStage>(["SHORTLIST"]);

  const applications = await prisma.application.findMany({ where: { userId } });
  if (applications.length > 0) unlocked.add("APPLICATIONS");

  const hasAcceptedOffer = applications.some((a) => a.status === "ACCEPTED");
  if (hasAcceptedOffer) unlocked.add("VISA_DOCS");

  if (hasAcceptedOffer) {
    const visaTasks = await prisma.task.findMany({ where: { userId, stage: "VISA_DOCS" } });
    const allVisaDone = visaTasks.length > 0 && visaTasks.every((t) => t.done);
    if (allVisaDone) unlocked.add("PRE_DEPARTURE");
  }

  return unlocked;
}

export class StageLockedError extends Error {
  constructor(stage: JourneyStage) {
    super(`The ${stage} stage isn't unlocked yet.`);
    this.name = "StageLockedError";
  }
}

export async function assertStageUnlocked(userId: string, stage: JourneyStage) {
  const unlocked = await computeUnlockedStages(userId);
  if (!unlocked.has(stage)) throw new StageLockedError(stage);
}
