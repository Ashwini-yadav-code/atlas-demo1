import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { scoreCourse } from "@/lib/matching";
import { ApplicationActions } from "@/components/ApplicationActions";

export default async function UniversityDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireUser();
  const { courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { university: true } });
  if (!course) notFound();

  const [application, shortlist] = await Promise.all([
    prisma.application.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } }),
    prisma.application.findMany({ where: { userId: user.id }, include: { course: { include: { university: true } } }, orderBy: { matchScore: "desc" } }),
  ]);

  const score = application?.matchScore ?? scoreCourse(user, course);

  return (
    <>
      <div className="detail-hero">
        <div className="svc-icon" style={{ background: "var(--panel)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10L12 4 2 10l10 6 10-6z" /><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></svg>
        </div>
        <div>
          <h1>{course.university.name}</h1>
          <div className="meta">
            <span className={`match-pill ${score >= 90 ? "match-high" : "match-mid"}`}>{score}% match</span>
            {application && <span className={`status-pill ${application.status === "SHORTLISTED" ? "draft" : "live"}`}>{statusLabel(application.status)}</span>}
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{course.name}</span>
          </div>
        </div>
        <div className="detail-actions">
          <ApplicationActions courseId={course.id} applicationId={application?.id} status={application?.status} />
        </div>
      </div>

      <div className="fact-grid">
        <div className="card"><div className="fact-label">Tuition / year</div><div className="fact-value">£{course.tuitionPerYear.toLocaleString()}</div></div>
        <div className="card"><div className="fact-label">Duration</div><div className="fact-value">{course.durationMonths / 12} year</div></div>
        <div className="card"><div className="fact-label">Start date</div><div className="fact-value">{course.startDate}</div></div>
        <div className="card"><div className="fact-label">Apply by</div><div className="fact-value">{course.applicationDeadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div></div>
        <div className="card"><div className="fact-label">Entry requirement</div><div className="fact-value">{course.entryRequirement}</div></div>
        <div className="card"><div className="fact-label">IELTS</div><div className="fact-value">{course.ieltsRequirement}</div></div>
      </div>

      <div className="detail-split" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, marginTop: 26, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="why-match">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
            <span>Scored live against your quiz profile — course fit, budget, and grade requirement, updated every time your profile changes.</span>
          </div>

          {course.aboutCourse && (
            <div className="card">
              <div className="panel-head"><h3>About the course</h3></div>
              <div className="detail-body" style={{ padding: "0 20px 22px" }}>
                {course.aboutCourse.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          )}

          {shortlist.length > 0 && (
            <div className="card">
              <div className="panel-head"><h3>Compare your shortlist</h3></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>University</th><th>Match</th><th>Tuition/yr</th><th>Deadline</th><th>Status</th></tr></thead>
                  <tbody>
                    {shortlist.map((a) => (
                      <tr key={a.id} className={a.courseId === course.id ? "this-row" : ""}>
                        <td>{a.course.university.name}</td>
                        <td><span className={`match-pill ${a.matchScore >= 90 ? "match-high" : "match-mid"}`}>{a.matchScore}%</span></td>
                        <td>£{a.course.tuitionPerYear.toLocaleString()}</td>
                        <td>{a.course.applicationDeadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                        <td><span className={`status-pill ${a.status === "SHORTLISTED" ? "draft" : "live"}`}>{statusLabel(a.status)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="card accent-dark status-card">
          <div className="panel-head" style={{ padding: "0 0 4px" }}><h3>Application status</h3></div>
          <div className="stepper" style={{ padding: "14px 4px 0" }}>
            {["applied", "offer", "accepted"].map((s, i) => {
              const idx = application ? statusIndex(application.status) : -1;
              const cls = i <= idx ? "done" : i === idx + 1 ? "now" : "locked";
              return (
                <div key={s} className={`step ${cls}`}>
                  {i > 0 && <div className="step-line" />}
                  <div className="step-dot">{i <= idx ? "✓" : i + 1}</div>
                  <div className="step-lbl">{s[0].toUpperCase() + s.slice(1)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {course.university.aboutCity && (
          <div className="card">
            <div className="panel-head"><h3>Campus &amp; city</h3></div>
            <div className="detail-body" style={{ padding: "0 20px 20px" }}>
              <p>{course.university.aboutCity}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function statusLabel(status: string) {
  return { NOT_APPLIED: "Not applied", SHORTLISTED: "Not yet applied", APPLIED: "Awaiting decision", OFFER: "Offer received", ACCEPTED: "Offer accepted", REJECTED: "Not successful" }[status] ?? status;
}
function statusIndex(status: string) {
  return { APPLIED: 0, OFFER: 1, ACCEPTED: 2 }[status] ?? -1;
}
