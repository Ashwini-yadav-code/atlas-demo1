"use client";

import { useState } from "react";

export function CommunityCta({ label }: { label: string }) {
  const [done, setDone] = useState(false);
  const doneLabel = label === "Apply now" ? "Applied ✓" : label === "RSVP" ? "You're going ✓" : "Marked as read ✓";

  return (
    <button type="button" className="btn btn-primary" disabled={done} onClick={() => setDone(true)}>
      {done ? doneLabel : label}
    </button>
  );
}
