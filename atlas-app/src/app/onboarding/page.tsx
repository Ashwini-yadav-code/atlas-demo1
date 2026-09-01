"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuiz } from "@/lib/actions";

const COURSES = ["Computer Science", "Data Science", "Business & Management", "Engineering", "Law", "Design"];
const CITIES = ["London", "Manchester", "Leeds", "Edinburgh", "Birmingham", "Coventry"];
const BUDGETS = ["Under £15k", "£15k – £20k", "£20k – £25k", "£25k – £30k", "£30k+"];
const LEVELS: { value: "TWELFTH_GRADE" | "BACHELORS" | "MASTERS"; label: string }[] = [
  { value: "TWELFTH_GRADE", label: "12th grade" },
  { value: "BACHELORS", label: "Bachelor's degree" },
  { value: "MASTERS", label: "Master's degree" },
];

const STEPS = ["Course", "Destination", "Budget", "Profile", "Review"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [course, setCourse] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [level, setLevel] = useState<"TWELFTH_GRADE" | "BACHELORS" | "MASTERS" | "">("");
  const [percentage, setPercentage] = useState("");
  const [englishTest, setEnglishTest] = useState("");

  function toggleCity(city: string) {
    setCities((cs) => (cs.includes(city) ? cs.filter((c) => c !== city) : [...cs, city]));
  }

  function canAdvance() {
    if (step === 0) return !!course;
    if (step === 2) return !!budget;
    if (step === 3) return !!level && !!percentage;
    return true;
  }

  async function finish() {
    setSubmitting(true);
    try {
      await submitQuiz({
        courseInterest: course,
        preferredCities: cities,
        budgetRange: budget,
        qualification: level as "TWELFTH_GRADE" | "BACHELORS" | "MASTERS",
        percentage,
        englishTest: englishTest || undefined,
      });
      router.push("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 24px 60px" }}>
      <div className="brand" style={{ marginBottom: 20 }}>
        <span className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 2L2 21h20L12 2z" /><path d="M12 9l4.5 9h-9L12 9z" opacity=".5" /></svg>
        </span>
        atlas
      </div>

      <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".06em" }}>
        Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}
      </div>
      <div className="stepper" style={{ padding: "8px 4px 26px" }}>
        {STEPS.map((label, i) => (
          <div key={label} className={`step ${i < step ? "done" : i === step ? "now" : "locked"}`}>
            {i > 0 && <div className="step-line" />}
            <div className="step-dot">{i < step ? "✓" : i + 1}</div>
            <div className="step-lbl">{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 34, minHeight: 320, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          {step === 0 && (
            <>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 23 }}>What do you want to study?</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "6px 0 24px" }}>Pick the closest match.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {COURSES.map((c) => (
                  <button key={c} type="button" className={`chip${course === c ? " active" : ""}`} onClick={() => setCourse(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 23 }}>Where in the UK?</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "6px 0 24px" }}>Pick as many as you&apos;d consider — or leave blank if flexible.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {CITIES.map((c) => (
                  <button key={c} type="button" className={`chip${cities.includes(c) ? " active" : ""}`} onClick={() => toggleCity(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 23 }}>What&apos;s your yearly budget?</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "6px 0 24px" }}>Tuition + living costs, in GBP.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {BUDGETS.map((b) => (
                  <button key={b} type="button" className={`chip${budget === b ? " active" : ""}`} onClick={() => setBudget(b)}>
                    {b}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 23 }}>Your academic profile</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "6px 0 20px" }}>This is what we match your shortlist against.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                {LEVELS.map((l) => (
                  <button key={l.value} type="button" className={`chip${level === l.value ? " active" : ""}`} onClick={() => setLevel(l.value)}>
                    {l.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="field">
                  <label className="field-label" htmlFor="pct">Overall percentage / GPA</label>
                  <input id="pct" className="field-input" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="e.g. 82%" />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="eng">English test score (optional)</label>
                  <input id="eng" className="field-input" value={englishTest} onChange={(e) => setEnglishTest(e.target.value)} placeholder="e.g. IELTS 7.0" />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 23 }}>Check your answers</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "6px 0 20px" }}>We&apos;ll match your shortlist against these.</p>
              {[
                ["Course", course || "—"],
                ["Cities", cities.length ? cities.join(", ") : "Flexible"],
                ["Budget", budget || "—"],
                ["Level", LEVELS.find((l) => l.value === level)?.label ?? "—"],
                ["Percentage / GPA", percentage || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", marginTop: 26, paddingTop: 20 }}>
          <button type="button" className="btn btn-secondary" style={{ visibility: step === 0 ? "hidden" : "visible" }} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
              Next
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={submitting} onClick={finish}>
              {submitting ? "Building your shortlist…" : "Get my shortlist"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
