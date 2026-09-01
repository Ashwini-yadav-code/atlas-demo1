"use client";

/** Last-resort boundary — only fires if the root layout itself throws, so
 * it can't rely on globals.css having loaded and has to render its own
 * <html>/<body>. Deliberately plain rather than pulling in the design
 * system for a case this rare. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Atlas hit a snag.</h1>
          <button type="button" onClick={() => reset()} style={{ padding: "10px 20px", borderRadius: 999, border: "none", background: "#14151a", color: "#fff", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
