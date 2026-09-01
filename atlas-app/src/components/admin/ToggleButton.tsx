"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function ToggleButton({
  action,
  id,
  on,
  onLabel,
  offLabel,
}: {
  action: (id: string) => Promise<void>;
  id: string;
  on: boolean;
  onLabel: string;
  offLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={`status-pill ${on ? "live" : "draft"}`}
      style={{ border: "none", cursor: "pointer" }}
      disabled={isPending}
      onClick={() => startTransition(async () => { await action(id); router.refresh(); })}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}
