import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ServiceFilters } from "@/components/ServiceFilters";

const CATEGORY_LABEL: Record<string, string> = {
  BANK: "UK bank account",
  SIM: "SIM & mobile plan",
  HOUSING: "Housing",
  FOREX: "Foreign exchange",
  INSURANCE: "Insurance",
  LOANS: "Student loans",
};
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  BANK: <><rect x="3" y="9" width="18" height="11" rx="2" /><path d="M3 9l9-6 9 6" /><path d="M7 13v4M12 13v4M17 13v4" /></>,
  SIM: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>,
  HOUSING: <><path d="M3 9.5L12 3l9 6.5V21H3z" /><path d="M9 21v-6h6v6" /></>,
  FOREX: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  INSURANCE: <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />,
  LOANS: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M2 10h20" /></>,
};

export default async function ServicesPage() {
  await requireUser();
  const partners = await prisma.servicePartner.findMany({ orderBy: { category: "asc" } });
  const byCategory = Object.entries(CATEGORY_LABEL).map(([cat, label]) => ({
    cat,
    label,
    count: partners.filter((p) => p.category === cat).length,
    priority: partners.find((p) => p.category === cat && p.isPriority),
  }));

  return (
    <>
      <div className="j-head">
        <div>
          <h1>Services</h1>
          <p>Vetted partners for everything you need to land and settle - no commissions steering the list.</p>
        </div>
      </div>

      <div className="trust-ribbon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
        Every partner here is vetted on our terms, not theirs - Atlas doesn&apos;t take a cut of what you choose.
      </div>

      <ServiceFilters categories={Object.entries(CATEGORY_LABEL).map(([cat, label]) => ({ cat, label }))}>
        {byCategory.map(({ cat, label, count, priority }) => (
          <Link key={cat} href={`/services/${cat.toLowerCase()}`} data-cat={cat} className="card svc-card tilt" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="svc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{CATEGORY_ICON[cat]}</svg>
            </div>
            <h4>{label}</h4>
            {priority?.priorityWhy && <span className="svc-why">{priority.priorityWhy}</span>}
            <p>{count} vetted partner{count === 1 ? "" : "s"} to compare.</p>
            <div className="svc-foot">
              <span className="svc-tag">{count} partners</span>
              <span className="svc-link">
                Explore
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </div>
          </Link>
        ))}
      </ServiceFilters>
    </>
  );
}
