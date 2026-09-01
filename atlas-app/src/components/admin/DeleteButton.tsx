"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ action, id }: { action: (id: string) => Promise<void>; id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-destructive btn-sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Remove this? This can't be undone.")) return;
        startTransition(async () => {
          await action(id);
          router.refresh();
        });
      }}
    >
      {isPending ? "…" : "Remove"}
    </button>
  );
}
