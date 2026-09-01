import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatDue } from "@/lib/format";
import { TaskRow } from "@/components/TaskRow";

function profileCompletion(user: {
  name: string | null;
  phone: string | null;
  qualification: string | null;
  percentage: string | null;
  englishTest: string | null;
  courseInterest: string | null;
  budgetRange: string | null;
}) {
  const fields = [user.name, user.phone, user.qualification, user.percentage, user.englishTest, user.courseInterest, user.budgetRange];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export default async function HomePage() {
  const user = await requireUser();

  const [applications, tasks, advisorLinks, taskCounts] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      include: { course: { include: { university: true } } },
      orderBy: { matchScore: "desc" },
      take: 3,
    }),
    prisma.task.findMany({ where: { userId: user.id, done: false }, orderBy: { dueAt: "asc" }, take: 3 }),
    prisma.studentAdvisor.findMany({ where: { studentId: user.id }, include: { advisor: true } }),
    prisma.task.groupBy({ by: ["done"], where: { userId: user.id }, _count: true }),
  ]);

  const offers = await prisma.application.count({ where: { userId: user.id, status: { in: ["OFFER", "ACCEPTED"] } } });
  const totalApplications = await prisma.application.count({ where: { userId: user.id } });
  const docsDone = taskCounts.find((t) => t.done)?._count ?? 0;
  const docsTotal = taskCounts.reduce((n, t) => n + t._count, 0);
  const pct = profileCompletion(user);

  if (applications.length === 0) {
    return (
      <>
        <div className="j-head">
          <div>
            <h1>Welcome, {user.name?.split(" ")[0] ?? "there"}</h1>
            <p>Let&apos;s find your shortlist — it takes about three minutes.</p>
          </div>
        </div>
        <div className="focus-card">
          <div className="focus-count">
            3<small>minutes</small>
          </div>
          <div className="focus-body">
            <h2>Take the quiz to get your shortlist</h2>
            <p>Answer a few questions about your course, budget and grades — we&apos;ll match you against a curated UK catalogue.</p>
          </div>
          <Link href="/onboarding" className="focus-cta" style={{ textDecoration: "none", display: "inline-block" }}>
            Take the 3-minute quiz
          </Link>
        </div>
        <div className="empty-card">
          <b>No shortlist yet</b>
          Your matched universities will show up here once you&apos;ve finished the quiz.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="j-head">
        <div>
          <h1>Welcome back, {user.name?.split(" ")[0] ?? "there"}</h1>
          <p>You&apos;re in the {user.currentStage.toLowerCase().replace("_", " ")} stage now.</p>
        </div>
      </div>

      <div className="focus-card">
        <div className="focus-count">
          {tasks.length}
          <small>tasks this week</small>
        </div>
        <div className="focus-body">
          <h2>Your checklist needs attention</h2>
          <p>Keep your applications and visa documents moving — your advisors are one message away.</p>
        </div>
        <Link href="/checklist" className="focus-cta" style={{ textDecoration: "none", display: "inline-block" }}>
          Open the checklist
        </Link>
      </div>

      <div className="home-grid">
        <div>
          <Link href="/profile" className="card accent-dark ring-card" style={{ textDecoration: "none", color: "inherit" }}>
            <svg className="ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--line-strong)" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--green)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * pct) / 100}
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="66" textAnchor="middle" fontSize="22" fontWeight="800" fill="currentColor">
                {pct}%
              </text>
            </svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Profile complete</div>
              <div style={{ opacity: 0.8, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                {pct < 100 ? "Fill in the rest of your profile to unlock more matches." : "Your profile is complete."}
              </div>
            </div>
          </Link>

          <div className="stat-row">
            <div className="card">
              <div className="stat-num">{totalApplications}</div>
              <div className="stat-lbl">Applications</div>
            </div>
            <div className="card">
              <div className="stat-num">{offers}</div>
              <div className="stat-lbl">Offers</div>
            </div>
            <div className="card">
              <div className="stat-num">
                {docsDone}/{docsTotal}
              </div>
              <div className="stat-lbl">Documents</div>
            </div>
          </div>
        </div>

        <div className="home-side">
          <div className="card">
            <div className="panel-head">
              <h3>Next up</h3>
              <span className="panel-note">{tasks.length} this week</span>
            </div>
            <div className="list-card tasklist">
              {tasks.length === 0 && <div className="empty on"><b>Nothing due</b>You&apos;re all caught up.</div>}
              {tasks.map((t) => (
                <TaskRow key={t.id} id={t.id} label={t.label} due={formatDue(t.dueAt, t.done)} done={t.done} note={t.note} />
              ))}
            </div>
          </div>

          <div className="card">
            <div className="panel-head">
              <h3>Your advisors</h3>
            </div>
            <div className="list-card">
              {advisorLinks.map((link) => (
                <Link key={link.id} href="/messages" className="row" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="p-avatar">
                    <img src={link.advisor.image ?? ""} alt={link.advisor.name} />
                  </div>
                  <div className="row-label">
                    {link.advisor.jobTitle}
                    <br />
                    <span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>{link.advisor.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <div className="panel-head">
          <h3>Your shortlist</h3>
          <Link href="/journey" className="svc-link" style={{ cursor: "pointer", textDecoration: "none" }}>
            View full journey
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
        <div className="shortlist-grid">
          {applications.map((a) => (
            <Link key={a.id} href={`/universities/${a.course.id}`} className="shortlist-card tilt" style={{ textDecoration: "none", color: "inherit" }}>
              <div className={`match-pill ${a.matchScore >= 90 ? "match-high" : "match-mid"}`}>{a.matchScore}% match</div>
              <h5>{a.course.university.name}</h5>
              <p>
                {a.course.name} · {statusLabel(a.status)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function statusLabel(status: string) {
  return {
    NOT_APPLIED: "Not yet applied",
    SHORTLISTED: "Not yet applied",
    APPLIED: "Awaiting decision",
    OFFER: "Offer received",
    ACCEPTED: "Offer accepted",
    REJECTED: "Not successful",
  }[status] ?? status;
}
