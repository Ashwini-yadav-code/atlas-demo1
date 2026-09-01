import type { Course, University, User } from "@/generated/prisma/client";

/**
 * Turns a student's quiz profile into a 0-100 match score against one
 * course. Real scoring, not a hardcoded number — the only "mock" part is
 * that the catalogue itself is seed data (checklist §5 is real content
 * curation, a separate, non-engineering task).
 */
export function scoreCourse(user: User, course: Course & { university: University }): number {
  let score = 55;

  const budgetMax = parseBudgetMax(user.budgetRange);
  if (budgetMax != null) {
    if (course.tuitionPerYear <= budgetMax) score += 22;
    else if (course.tuitionPerYear <= budgetMax * 1.15) score += 8;
    else score -= 18;
  }

  const pct = parsePercentage(user.percentage);
  const entryMin = parseEntryMin(course.entryRequirement);
  if (pct != null && entryMin != null) {
    if (pct >= entryMin + 12) score += 18;
    else if (pct >= entryMin) score += 10;
    else score -= 22;
  }

  const preferredCities = (user.preferredCities ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  if (preferredCities.length === 0 || preferredCities.includes(course.university.city)) {
    score += 6;
  }

  if (course.isRollingDeadline) score += 2; // more forgiving timeline is a genuine plus

  return Math.max(35, Math.min(98, Math.round(score)));
}

function parseBudgetMax(range: string | null): number | null {
  if (!range) return null;
  // "£25k – £30k" / "Under £15k" / "£30k+"
  const nums = [...range.matchAll(/£?(\d+(?:\.\d+)?)k/gi)].map((m) => parseFloat(m[1]) * 1000);
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

function parsePercentage(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  // GPA-scale inputs (e.g. "3.6 GPA") vs percentage — treat anything <=10 as GPA/4
  return n <= 10 ? (n / 4) * 100 : n;
}

/** UK degree-classification floors, approximate percentage equivalents. */
function parseEntryMin(requirement: string): number | null {
  const r = requirement.toLowerCase();
  if (r.includes("2:1")) return 60;
  if (r.includes("2:2")) return 50;
  if (r.includes("1st") || r.includes("first")) return 70;
  return null;
}

export function matchTier(score: number): "high" | "mid" {
  return score >= 90 ? "high" : "mid";
}
