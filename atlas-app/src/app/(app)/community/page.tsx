import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CommunitySearch } from "@/components/CommunitySearch";

const COLUMNS: { type: "JOB" | "EVENT" | "GUIDE"; label: string; dot: string }[] = [
  { type: "JOB", label: "Jobs", dot: "var(--blue)" },
  { type: "EVENT", label: "Events", dot: "var(--coral)" },
  { type: "GUIDE", label: "Guides", dot: "var(--green)" },
];

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const { q } = await searchParams;
  const content = await prisma.communityContent.findMany({
    where: { status: "PUBLISHED", ...(q ? { OR: [{ title: { contains: q } }, { body: { contains: q } }] } : {}) },
    orderBy: { createdAt: "desc" },
  });

  if (q && content.length === 0) {
    return (
      <>
        <div className="j-head">
          <div>
            <h1>Community</h1>
            <p>Jobs, events and guides for life after you land - the part of the journey that doesn&apos;t end at arrival.</p>
          </div>
          <CommunitySearch />
        </div>
        <div className="empty on">
          <b>Nothing matches that search</b>Try a shorter phrase, or clear the field to see everything.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="j-head">
        <div>
          <h1>Community</h1>
          <p>Jobs, events and guides for life after you land - the part of the journey that doesn&apos;t end at arrival.</p>
        </div>
        <CommunitySearch />
      </div>

      <div className="comm-grid" id="commGrid">
        {COLUMNS.map((col) => {
          const items = content.filter((c) => c.type === col.type).slice(0, 3);
          return (
            <div key={col.type} className="comm-col">
              <h3>
                <span className="dot" style={{ background: col.dot }} />
                {col.label}
                <Link href={`/community/${col.type.toLowerCase()}`} className="comm-view-all" style={{ textDecoration: "none" }}>
                  View all
                </Link>
              </h3>
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/community/${col.type.toLowerCase()}/${item.id}`}
                  className="card comm-card tilt"
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <div className="eyebrow">{item.eyebrow}</div>
                  <h5>{item.title}</h5>
                  <p>{item.body.split("\n\n")[0].slice(0, 90)}</p>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
