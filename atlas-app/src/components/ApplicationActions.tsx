"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToShortlist, submitApplication } from "@/lib/actions";

export function ApplicationActions({
  courseId,
  applicationId,
  status,
}: {
  courseId: string;
  applicationId?: string;
  status?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!status) {
    return (
      <button
        type="button"
        className="btn btn-primary"
        disabled={isPending}
        onClick={() => startTransition(async () => { await addToShortlist(courseId); router.refresh(); })}
      >
        {isPending ? "Adding…" : "Add to shortlist"}
      </button>
    );
  }

  if (status === "SHORTLISTED") {
    return (
      <button
        type="button"
        className="btn btn-primary"
        disabled={isPending}
        onClick={() => startTransition(async () => { await submitApplication(applicationId!); router.refresh(); })}
      >
        {isPending ? "Submitting…" : "Start application"}
      </button>
    );
  }

  return <button type="button" className="btn btn-secondary" disabled>In your shortlist</button>;
}
