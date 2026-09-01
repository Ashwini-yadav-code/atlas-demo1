import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { scoreCourse, matchTier } from "@/lib/matching";

export default async function UniversitiesPage() {
  const user = await requireUser();
  const [courses, applications] = await Promise.all([
    prisma.course.findMany({ include: { university: true } }),
    prisma.application.findMany({ where: { userId: user.id } }),
  ]);

  const shortlistedIds = new Set(applications.map((a) => a.courseId));
  const ranked = courses
    .map((c) => ({ course: c, score: scoreCourse(user, c), shortlisted: shortlistedIds.has(c.id) }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0];

  return (
    <>
      <div className="j-head">
        <div>
          <h1>Browse universities</h1>
          <p>Every course in the curated catalogue, ranked against your quiz answers — not just your shortlist.</p>
        </div>
      </div>

      {top && (
        <div className="focus-card">
          <div className="focus-count">
            {top.score}
            <small>% match</small>
          </div>
          <div className="focus-body">
            <h2>Your top match: {top.course.university.name}</h2>
            <p>Closest fit to your course, budget and grades across the full catalogue.</p>
          </div>
          <Link href={`/universities/${top.course.id}`} className="focus-cta" style={{ textDecoration: "none", display: "inline-block" }}>
            View details
          </Link>
        </div>
      )}

      <div className="cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {ranked.map(({ course, score, shortlisted }) => (
          <Link
            key={course.id}
            href={`/universities/${course.id}`}
            className="card tilt"
            style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, textDecoration: "none", color: "inherit" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <span className={`match-pill ${matchTier(score) === "high" ? "match-high" : "match-mid"}`}>{score}% match</span>
              {shortlisted && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "var(--green-soft)", color: "var(--green)" }}>
                  Shortlisted
                </span>
              )}
            </div>
            <h5 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700 }}>{course.university.name}</h5>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{course.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>£{course.tuitionPerYear.toLocaleString()}/yr</span>
              <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                Apply by {course.applicationDeadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
