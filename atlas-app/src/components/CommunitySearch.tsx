"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CommunitySearch() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <label className="url-bar comm-search" style={{ margin: 0 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
      <input
        type="search"
        placeholder="Search jobs, events, guides"
        aria-label="Search jobs, events and guides"
        defaultValue={params.get("q") ?? ""}
        onChange={(e) => {
          const q = e.target.value;
          router.push(q ? `/community?q=${encodeURIComponent(q)}` : "/community");
        }}
      />
    </label>
  );
}
