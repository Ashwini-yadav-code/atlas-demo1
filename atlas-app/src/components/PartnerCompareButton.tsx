"use client";

import { useTransition } from "react";
import { logPartnerClick } from "@/lib/actions";

export function PartnerCompareButton({ partnerId, websiteUrl }: { partnerId: string; websiteUrl: string | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logPartnerClick(partnerId);
        });
        if (websiteUrl) window.open(websiteUrl, "_blank", "noopener,noreferrer");
      }}
    >
      Compare
    </button>
  );
}
