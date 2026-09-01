"use client";

/** Route-level error boundary for everything under (app) — a failed
 * server component (e.g. the DB unreachable) lands here instead of
 * Next's generic error screen. Sidebar/topbar chrome (from the layout,
 * outside this boundary) stays visible, per ux-spec §5: "Error (inline):
 * ... positioned at the top of the affected card/section (not a
 * full-page takeover)." */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="banner-error" style={{ marginTop: 8 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16v.1" /></svg>
      <span>Something went wrong loading this page{error.digest ? ` (ref ${error.digest})` : ""}.</span>
      <span className="retry" role="button" tabIndex={0} onClick={() => reset()}>
        Try again
      </span>
    </div>
  );
}
