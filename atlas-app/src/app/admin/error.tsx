"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="banner-error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16v.1" /></svg>
      <span>Something went wrong{error.digest ? ` (ref ${error.digest})` : ""}.</span>
      <span className="retry" role="button" tabIndex={0} onClick={() => reset()}>
        Try again
      </span>
    </div>
  );
}
