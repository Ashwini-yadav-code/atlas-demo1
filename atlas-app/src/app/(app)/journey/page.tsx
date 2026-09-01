import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { computeUnlockedStages, STAGE_ORDER } from "@/lib/stage";
import { formatDue } from "@/lib/format";
import { JourneyBoard } from "@/components/JourneyBoard";

const STAGE_LABEL: Record<string, string> = {
  SHORTLIST: "Shortlist",
  APPLICATIONS: "Applications",
  VISA_DOCS: "Visa & docs",
  PRE_DEPARTURE: "After the visa",
  ARRIVAL: "Arrival",
};

export default async function JourneyPage() {
  const user = await requireUser();
  const [tasksByStage, applications, unlocked] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.application.findMany({ where: { userId: user.id }, include: { course: { include: { university: true } } } }),
    computeUnlockedStages(user.id),
  ]);

  const stageIndex = STAGE_ORDER.indexOf(user.currentStage);

  return (
    <>
      <div className="j-head">
        <div>
          <h1>Your Journey</h1>
          <p>
            {applications.length} application{applications.length === 1 ? "" : "s"} in progress. Tasks below need you — your advisors are one tap
            away.
          </p>
        </div>
      </div>

      <div className="card accent-dark stage-rail">
        <div className="stepper">
          {STAGE_ORDER.slice(0, 4).map((stage, i) => (
            <div key={stage} className={`step ${i < stageIndex ? "done" : i === stageIndex ? "now" : unlocked.has(stage) ? "" : "locked"}`}>
              {i > 0 && <div className="step-line" />}
              <div className="step-dot">{i < stageIndex ? "✓" : i + 1}</div>
              <div className="step-lbl">{STAGE_LABEL[stage]}</div>
              {!unlocked.has(stage) && i > stageIndex && <div className="step-note">Locked until earlier stages complete</div>}
            </div>
          ))}
        </div>
      </div>

      <JourneyBoard
        columns={STAGE_ORDER.slice(0, 4).map((stage) => ({
          stage,
          label: STAGE_LABEL[stage],
          unlocked: unlocked.has(stage),
          tasks: tasksByStage
            .filter((t) => t.stage === stage)
            .map((t) => ({ id: t.id, label: t.label, done: t.done, note: t.note, due: formatDue(t.dueAt, t.done) })),
        }))}
      />

      <div className="split" style={{ marginTop: 30 }}>
        <div className="card">
          <div className="panel-head">
            <h3>Your applications</h3>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>University</th>
                  <th>Match</th>
                  <th>Status</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/universities/${a.course.id}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>
                        {a.course.university.name}
                      </Link>
                    </td>
                    <td>
                      <span className={`match-pill ${a.matchScore >= 90 ? "match-high" : "match-mid"}`}>{a.matchScore}%</span>
                    </td>
                    <td>
                      <span className={`status-pill ${a.status === "SHORTLISTED" ? "draft" : "live"}`}>{a.status.replace("_", " ")}</span>
                    </td>
                    <td>{a.course.applicationDeadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
