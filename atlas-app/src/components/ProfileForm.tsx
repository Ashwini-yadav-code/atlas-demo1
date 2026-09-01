"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { updateProfile } from "@/lib/actions";

type Fields = {
  name: string;
  email: string;
  phone: string;
  homeCity: string;
  qualification: string;
  percentage: string;
  englishTest: string;
  courseInterest: string;
  budgetRange: string;
};

const LEVELS: { value: "TWELFTH_GRADE" | "BACHELORS" | "MASTERS"; label: string }[] = [
  { value: "TWELFTH_GRADE", label: "12th grade" },
  { value: "BACHELORS", label: "Bachelor's degree" },
  { value: "MASTERS", label: "Master's degree" },
];
const COURSES = ["Computer Science", "Data Science", "Business & Management", "Engineering"];
const BUDGETS = ["£15k – £20k", "£20k – £25k", "£25k – £30k", "£30k+"];

export function ProfileForm({ user }: { user: Fields }) {
  const router = useRouter();
  const [form, setForm] = useState(user);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toggles, setToggles] = useState({ email: true, whatsapp: true, digest: false });

  const pct = useMemo(() => {
    const tracked = [form.name, form.phone, form.qualification, form.percentage, form.englishTest, form.courseInterest, form.budgetRange];
    return Math.round((tracked.filter(Boolean).length / tracked.length) * 100);
  }, [form]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProfile({
        name: form.name,
        phone: form.phone || undefined,
        homeCity: form.homeCity || undefined,
        qualification: (form.qualification || undefined) as "TWELFTH_GRADE" | "BACHELORS" | "MASTERS" | undefined,
        percentage: form.percentage || undefined,
        englishTest: form.englishTest || undefined,
        courseInterest: form.courseInterest || undefined,
        budgetRange: form.budgetRange || undefined,
      });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong. Try again.");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2200);
    });
  }

  return (
    <form onSubmit={save}>
      <div className="card accent-dark" style={{ padding: 26, display: "flex", alignItems: "center", gap: 22 }}>
        <svg className="ring" viewBox="0 0 120 120" style={{ width: 88, height: 88, flex: "none" }}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--line-strong)" strokeWidth="12" />
          <circle
            cx="60" cy="60" r="50" fill="none" stroke="var(--green)" strokeWidth="12" strokeLinecap="round"
            strokeDasharray="314" strokeDashoffset={314 - (314 * pct) / 100} transform="rotate(-90 60 60)"
          />
          <text x="60" y="66" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">{pct}%</text>
        </svg>
        <div>
          <b style={{ fontFamily: "var(--font-heading)", fontSize: 16 }}>Profile complete</b>
          <p style={{ fontSize: 12.5, opacity: 0.82, marginTop: 4, lineHeight: 1.5 }}>
            {pct >= 100 ? "Your profile is complete — nice work." : "Fill in the rest of your profile to unlock more matches."}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: "22px 24px", marginTop: 18 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Personal details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field">
            <label className="field-label">Full name</label>
            <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="field-input" value={form.email} disabled />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div className="field">
            <label className="field-label">Phone</label>
            <input className="field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Home city</label>
            <input className="field-input" value={form.homeCity} onChange={(e) => setForm({ ...form, homeCity: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "22px 24px", marginTop: 18 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Academic profile</h3>
        <div className="field" style={{ marginBottom: 16 }}>
          <label className="field-label">Current qualification</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LEVELS.map((l) => (
              <button key={l.value} type="button" className={`chip${form.qualification === l.value ? " active" : ""}`} onClick={() => setForm({ ...form, qualification: l.value })}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field">
            <label className="field-label">Overall percentage / GPA</label>
            <input className="field-input" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">English test score</label>
            <input className="field-input" placeholder="e.g. IELTS 7.0" value={form.englishTest} onChange={(e) => setForm({ ...form, englishTest: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "22px 24px", marginTop: 18 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Course preferences</h3>
        <div className="field" style={{ marginBottom: 16 }}>
          <label className="field-label">Course interest</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {COURSES.map((c) => (
              <button key={c} type="button" className={`chip${form.courseInterest === c ? " active" : ""}`} onClick={() => setForm({ ...form, courseInterest: c })}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label">Yearly budget</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {BUDGETS.map((b) => (
              <button key={b} type="button" className={`chip${form.budgetRange === b ? " active" : ""}`} onClick={() => setForm({ ...form, budgetRange: b })}>
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "22px 24px", marginTop: 18 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Notifications</h3>
        {(["email", "whatsapp", "digest"] as const).map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                {key === "email" ? "Email updates" : key === "whatsapp" ? "WhatsApp reminders" : "Community digest"}
              </div>
            </div>
            <div
              role="switch"
              aria-checked={toggles[key]}
              tabIndex={0}
              onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
              style={{
                width: 42, height: 24, borderRadius: 999, cursor: "pointer", position: "relative",
                background: toggles[key] ? "var(--green)" : "var(--line)", transition: "background .15s ease",
              }}
            >
              <span style={{ position: "absolute", top: 3, left: toggles[key] ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="banner-error" style={{ marginTop: 18 }}>
          <span>{error}</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: 22, paddingBottom: 40, alignItems: "center" }}>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ width: 14, height: 14 }}><path d="M20 6L9 17l-5-5" /></svg>
            Saved
          </span>
        )}
        <button
          type="button"
          className="btn btn-destructive"
          style={{ marginLeft: "auto" }}
          onClick={() => signOut({ callbackUrl: "/auth" })}
        >
          Log out
        </button>
      </div>
    </form>
  );
}
