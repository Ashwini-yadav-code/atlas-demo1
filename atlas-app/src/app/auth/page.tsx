"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setDevCode(data.devCode ?? null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("otp", { email, code, name, redirect: false });
      if (res?.error) {
        setError("That code didn't match. Try again, or resend.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <div className="brand" style={{ marginBottom: 24 }}>
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 2L2 21h20L12 2z" /><path d="M12 9l4.5 9h-9L12 9z" opacity=".5" /></svg>
          </span>
          atlas
        </div>

        {step === "identity" && (
          <form onSubmit={requestCode}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 25, letterSpacing: "-.02em" }}>
              Log in or sign up
            </h1>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "6px 0 22px" }}>
              We&apos;ll email you a 6-digit code — no password to remember.
            </p>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="field-label" htmlFor="name">Full name (new accounts)</label>
              <input id="name" className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>
            {error && <div className="banner-error" style={{ marginTop: 14 }}><span>{error}</span></div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 18 }}>
              {loading ? "Sending…" : "Continue"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verify}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 25, letterSpacing: "-.02em" }}>
              Enter your code
            </h1>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "6px 0 18px" }}>
              We sent a 6-digit code to <b style={{ color: "var(--ink)" }}>{email}</b>.
            </p>
            {devCode && (
              <div className="banner-error" style={{ marginBottom: 14, background: "var(--blue-soft)" }}>
                <span>Dev mode — no email provider configured. Your code is <b>{devCode}</b>.</span>
              </div>
            )}
            <div className="field">
              <label className="field-label" htmlFor="code">6-digit code</label>
              <input
                id="code"
                className="field-input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoFocus
              />
            </div>
            {error && <div className="banner-error" style={{ marginTop: 14 }}><span>{error}</span></div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading || code.length < 6} style={{ marginTop: 18 }}>
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => setStep("identity")}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
