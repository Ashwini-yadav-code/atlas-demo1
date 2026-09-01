import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { computeUnlockedStages, STAGE_ORDER } from "@/lib/stage";
import { formatDue } from "@/lib/format";
import { ChecklistView } from "@/components/ChecklistView";

const LABEL: Record<string, string> = {
  SHORTLIST: "Shortlist",
  APPLICATIONS: "Applications",
  VISA_DOCS: "Visa & docs",
  PRE_DEPARTURE: "After the visa",
  ARRIVAL: "Arrival",
};

export default async function ChecklistPage() {
  const user = await requireUser();
  const [tasks, unlocked] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    computeUnlockedStages(user.id),
  ]);

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="j-head">
        <div>
          <h1>Your checklist</h1>
          <p>Tick-only, per stage — no uploads. Your advisor sees exactly what you&apos;ve confirmed.</p>
        </div>
      </div>

      <ChecklistView
        stages={STAGE_ORDER.slice(0, 4).map((stage) => ({
          stage,
          label: LABEL[stage],
          unlocked: unlocked.has(stage),
          tasks: tasks
            .filter((t) => t.stage === stage)
            .map((t) => ({ id: t.id, label: t.label, done: t.done, note: t.note, due: formatDue(t.dueAt, t.done) })),
        }))}
        currentStage={user.currentStage}
      />
    </div>
  );
}
