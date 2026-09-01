import { describe, expect, it } from "vitest";
import { matchTier, scoreCourse } from "@/lib/matching";
import type { Course, University, User } from "@/generated/prisma/client";

/** Minimal fixtures — only the fields scoreCourse actually reads. Cast
 * through `as` rather than filling every Prisma-generated field, since
 * this is testing pure scoring logic, not the schema. */
function user(overrides: Partial<User> = {}): User {
  return {
    budgetRange: null,
    percentage: null,
    preferredCities: null,
    ...overrides,
  } as User;
}

function course(overrides: Partial<Course & { university: University }> = {}): Course & { university: University } {
  return {
    tuitionPerYear: 20000,
    entryRequirement: "2:1 Hons",
    isRollingDeadline: false,
    university: { city: "Manchester" } as University,
    ...overrides,
  } as Course & { university: University };
}

describe("scoreCourse", () => {
  it("gives a well-matched, in-budget, in-city, over-qualified course a high score", () => {
    const score = scoreCourse(
      user({ budgetRange: "£20k – £25k", percentage: "82%", preferredCities: "Manchester" }),
      course({ tuitionPerYear: 18000, entryRequirement: "2:1 Hons", university: { city: "Manchester" } as University })
    );
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it("penalizes a course well over budget", () => {
    const inBudget = scoreCourse(user({ budgetRange: "£20k – £25k" }), course({ tuitionPerYear: 20000 }));
    const overBudget = scoreCourse(user({ budgetRange: "£20k – £25k" }), course({ tuitionPerYear: 35000 }));
    expect(overBudget).toBeLessThan(inBudget);
  });

  it("gives partial credit for slightly over budget (within 15%)", () => {
    const overBudget = scoreCourse(user({ budgetRange: "£20k – £25k" }), course({ tuitionPerYear: 35000 }));
    const slightlyOver = scoreCourse(user({ budgetRange: "£20k – £25k" }), course({ tuitionPerYear: 27000 }));
    expect(slightlyOver).toBeGreaterThan(overBudget);
  });

  it("rewards grades comfortably above the entry requirement", () => {
    const comfortable = scoreCourse(user({ percentage: "80%" }), course({ entryRequirement: "2:1 Hons" })); // 60 + 12
    const borderline = scoreCourse(user({ percentage: "62%" }), course({ entryRequirement: "2:1 Hons" }));
    expect(comfortable).toBeGreaterThan(borderline);
  });

  it("penalizes grades below the entry requirement", () => {
    const belowReq = scoreCourse(user({ percentage: "45%" }), course({ entryRequirement: "2:1 Hons" }));
    const meetsReq = scoreCourse(user({ percentage: "62%" }), course({ entryRequirement: "2:1 Hons" }));
    expect(belowReq).toBeLessThan(meetsReq);
  });

  it("treats a GPA-scale percentage (<=10) as GPA/4", () => {
    // 3.6 GPA -> 90%, comfortably above a 2:1's 60% floor
    const gpaScore = scoreCourse(user({ percentage: "3.6 GPA" }), course({ entryRequirement: "2:1 Hons" }));
    const equivalentScore = scoreCourse(user({ percentage: "90%" }), course({ entryRequirement: "2:1 Hons" }));
    expect(gpaScore).toBe(equivalentScore);
  });

  it("gives a small bonus for a rolling deadline", () => {
    const rolling = scoreCourse(user(), course({ isRollingDeadline: true }));
    const fixed = scoreCourse(user(), course({ isRollingDeadline: false }));
    expect(rolling).toBe(fixed + 2);
  });

  it("doesn't penalize a city outside preferredCities into unfairness — only withholds the in-city bonus", () => {
    const preferredElsewhere = scoreCourse(
      user({ preferredCities: "London" }),
      course({ university: { city: "Manchester" } as University })
    );
    const noPreference = scoreCourse(user({ preferredCities: null }), course({ university: { city: "Manchester" } as University }));
    expect(preferredElsewhere).toBeLessThan(noPreference);
  });

  it("clamps the score into [35, 98] even for a very bad match", () => {
    const score = scoreCourse(
      user({ budgetRange: "Under £5k", percentage: "20%", preferredCities: "London" }),
      course({ tuitionPerYear: 40000, entryRequirement: "1st Class", university: { city: "Manchester" } as University })
    );
    expect(score).toBeGreaterThanOrEqual(35);
    expect(score).toBeLessThanOrEqual(98);
  });

  it("clamps the score into [35, 98] even for a perfect match", () => {
    const score = scoreCourse(
      user({ budgetRange: "£30k+", percentage: "95%", preferredCities: "Manchester" }),
      course({ tuitionPerYear: 15000, entryRequirement: "2:2 Hons", isRollingDeadline: true, university: { city: "Manchester" } as University })
    );
    expect(score).toBeLessThanOrEqual(98);
  });

  it("defaults to the base score of 55 (+city bonus) when the user has no quiz data at all", () => {
    const score = scoreCourse(user(), course());
    expect(score).toBe(55 + 6); // no budget/percentage data to score against, no preferred cities => city bonus applies
  });
});

describe("matchTier", () => {
  it("is 'high' at and above 90", () => {
    expect(matchTier(90)).toBe("high");
    expect(matchTier(98)).toBe("high");
  });

  it("is 'mid' below 90", () => {
    expect(matchTier(89)).toBe("mid");
    expect(matchTier(35)).toBe("mid");
  });
});
