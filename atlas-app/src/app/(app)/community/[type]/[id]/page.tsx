import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CommunityCta } from "@/components/CommunityCta";

export default async function CommunityDetailPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  await requireUser();
  const { id } = await params;
  const item = await prisma.communityContent.findUnique({ where: { id } });
  if (!item) notFound();

  const facts: [string, string][] = [];
  if (item.type === "JOB") {
    facts.push(["Category", "Job"]);
  } else if (item.type === "EVENT") {
    if (item.eventDate) facts.push(["Date", item.eventDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })]);
    if (item.location) facts.push(["Location", item.location]);
    if (item.capacity) facts.push(["Capacity", `${item.capacity} spots`]);
    if (item.going != null) facts.push(["Going", `${item.going} of ${item.capacity ?? "?"}`]);
  } else {
    if (item.readMinutes) facts.push(["Read time", `${item.readMinutes} minutes`]);
  }

  const cta = item.type === "JOB" ? "Apply now" : item.type === "EVENT" ? "RSVP" : "Mark as read";

  return (
    <>
      <div className="detail-hero">
        <div>
          <span style={{ fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 600 }}>{item.eyebrow}</span>
          <h1 style={{ marginTop: 6 }}>{item.title}</h1>
        </div>
        <div className="detail-actions">
          <CommunityCta label={cta} />
        </div>
      </div>

      <div className="cd-split" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22, marginTop: 22, alignItems: "start" }}>
        <div className="card">
          <div className="detail-body" style={{ padding: "22px 24px" }}>
            {item.body.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="card">
            <div className="panel-head">
              <h3>{item.type === "JOB" ? "Role details" : item.type === "EVENT" ? "Event details" : "At a glance"}</h3>
            </div>
            <div className="fact-grid" style={{ padding: "0 20px 20px", gridTemplateColumns: "1fr" }}>
              {facts.map(([k, v]) => (
                <div key={k}>
                  <div className="fact-label">{k}</div>
                  <div className="fact-value" style={{ fontSize: 14 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {item.requirements && (
            <div className="card">
              <div className="panel-head">
                <h3>What you&apos;ll need</h3>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, padding: "0 20px 20px" }}>
                {item.requirements.split("\n").map((r) => (
                  <li key={r} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ width: 15, height: 15, color: "var(--green)", flex: "none", marginTop: 2 }}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.authorName && (
            <div className="card">
              <div className="panel-head">
                <h3>Written by</h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 20px" }}>
                <img src={item.authorImage ?? ""} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <b style={{ fontSize: 13.5 }}>{item.authorName}</b>
                  <span style={{ display: "block", fontSize: 12, color: "var(--ink-soft)" }}>{item.authorRole}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
