import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PartnerCompareButton } from "@/components/PartnerCompareButton";
import type { ServiceCategory } from "@/generated/prisma/enums";

const LABEL: Record<string, string> = {
  bank: "UK bank account",
  sim: "SIM & mobile plan",
  housing: "Housing",
  forex: "Foreign exchange",
  insurance: "Insurance",
  loans: "Student loans",
};
const BLURB: Record<string, string> = {
  bank: "Compare student accounts that don't need a UK address on day one.",
  sim: "eSIMs you can activate before you land, plus long-term UK plans.",
  housing: "Verified student accommodation near your campus, no agent fees.",
  forex: "Send tuition and living costs at rates better than your bank's.",
  insurance: "Health and travel cover that satisfies your visa requirements.",
  loans: "Collateral-free lenders that work with your university's cost of attendance.",
};

export default async function ServiceCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  await requireUser();
  const { category } = await params;
  const cat = category.toUpperCase() as ServiceCategory;
  if (!LABEL[category]) notFound();

  const partners = await prisma.servicePartner.findMany({ where: { category: cat } });
  if (partners.length === 0) notFound();
  const priorityWhy = partners.find((p) => p.isPriority)?.priorityWhy;

  return (
    <>
      <div className="detail-hero">
        <div className="svc-icon" style={{ width: 56, height: 56, borderRadius: 16 }} />
        <div>
          <h1>{LABEL[category]}</h1>
          <div className="meta">
            <span className="svc-tag">{partners.length} partners</span>
            {priorityWhy && <span style={{ fontSize: 13, fontWeight: 700, color: "#8a4b06" }}>{priorityWhy}</span>}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: "70ch", marginBottom: 24 }}>{BLURB[category]}</p>

      <div className="trust-ribbon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
        Every partner below is vetted on our terms — paying more never buys a higher place in this list.
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <div className="panel-head">
          <h3>Compare partners</h3>
        </div>
        <div>
          {partners.map((p) => (
            <div key={p.id} className="partner-row">
              <div className="partner-logo">{p.name.slice(0, 2).toUpperCase()}</div>
              <div className="partner-info">
                <h5>{p.name}</h5>
                <span>{p.blurb}</span>
              </div>
              <div className="partner-stats">
                <div>
                  <b>{p.stat1Value}</b>
                  <small>{p.stat1Label}</small>
                </div>
                <div>
                  <b>{p.stat2Value}</b>
                  <small>{p.stat2Label}</small>
                </div>
              </div>
              <PartnerCompareButton partnerId={p.id} websiteUrl={p.websiteUrl} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
