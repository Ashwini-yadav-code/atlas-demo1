import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { CommunityType } from "@/generated/prisma/enums";

const META: Record<string, { title: string; sub: string }> = {
  job: { title: "Jobs", sub: "Part-time and graduate-route roles within your visa's work limits." },
  event: { title: "Events", sub: "Meetups and briefings from students already in the UK." },
  guide: { title: "Guides", sub: "Short reads on the parts of settling in nobody explains up front." },
};

export default async function CommunityTypePage({ params }: { params: Promise<{ type: string }> }) {
  await requireUser();
  const { type } = await params;
  if (!META[type]) notFound();

  const items = await prisma.communityContent.findMany({
    where: { type: type.toUpperCase() as CommunityType, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="j-head">
        <div>
          <h1>{META[type].title}</h1>
          <p>{META[type].sub}</p>
        </div>
      </div>
      <div className="comm-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {items.map((item) => (
          <Link key={item.id} href={`/community/${type}/${item.id}`} className="card comm-card tilt" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="eyebrow">{item.eyebrow}</div>
            <h5>{item.title}</h5>
            <p>{item.body.split("\n\n")[0].slice(0, 100)}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
