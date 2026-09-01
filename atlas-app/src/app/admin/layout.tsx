import Link from "next/link";
import { requireAdmin } from "@/lib/session";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/universities", label: "Catalogue" },
  { href: "/admin/services", label: "Service partners" },
  { href: "/admin/community", label: "Community content" },
  { href: "/admin/advisors", label: "Advisor console" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="screen">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>
        <div className="brand" style={{ marginBottom: 6 }}>
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 2L2 21h20L12 2z" /><path d="M12 9l4.5 9h-9L12 9z" opacity=".5" /></svg>
          </span>
          atlas <span style={{ color: "var(--ink-soft)", fontWeight: 600, marginLeft: 4 }}>admin</span>
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 12.5, marginBottom: 22 }}>
          Internal only — checklist §4. Not styled to the same polish as the student app on purpose.
        </p>
        <div className="chip-row">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="chip" style={{ textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/" className="chip" style={{ textDecoration: "none", marginLeft: "auto" }}>
            ← Back to app
          </Link>
        </div>
        <div style={{ marginTop: 22 }}>{children}</div>
      </div>
    </div>
  );
}
