import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Real query against the catalogue/services/community tables — not a
 * client-side filter over a hardcoded array, per checklist §2. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    // no query yet: surface a small default set rather than nothing
    const [courses, services] = await Promise.all([
      prisma.course.findMany({ take: 4, include: { university: true } }),
      prisma.servicePartner.findMany({ take: 2 }),
    ]);
    return NextResponse.json({
      results: [
        ...courses.map((c) => ({
          label: c.university.name,
          sub: `University · ${c.name}`,
          href: `/universities/${c.id}`,
        })),
        ...services.map((s) => ({
          label: s.name,
          sub: `Service · ${s.category}`,
          href: `/services/${s.category.toLowerCase()}`,
        })),
      ],
    });
  }

  const [courses, services, community] = await Promise.all([
    prisma.course.findMany({
      where: { university: { name: { contains: q } } },
      include: { university: true },
      take: 6,
    }),
    prisma.servicePartner.findMany({ where: { name: { contains: q } }, take: 6 }),
    prisma.communityContent.findMany({ where: { title: { contains: q }, status: "PUBLISHED" }, take: 6 }),
  ]);

  const results = [
    ...courses.map((c) => ({ label: c.university.name, sub: `University · ${c.name}`, href: `/universities/${c.id}` })),
    ...services.map((s) => ({ label: s.name, sub: `Service · ${s.category}`, href: `/services/${s.category.toLowerCase()}` })),
    ...community.map((c) => ({ label: c.title, sub: c.type, href: `/community/${c.type.toLowerCase()}/${c.id}` })),
  ];

  return NextResponse.json({ results });
}
