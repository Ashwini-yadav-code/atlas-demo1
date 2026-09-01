"use client";

/** Catches errors in /auth, /onboarding, and anything else outside the
 * (app)/admin route groups (which have their own, chrome-aware boundaries). */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="screen" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, padding: 32, textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBottom: 20 }}>
          {error.digest ? `Reference: ${error.digest}` : "Give it another try."}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
