import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [users, applications, courses, partners, community, unread, partnerClicks] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.application.count(),
    prisma.course.count(),
    prisma.servicePartner.count(),
    prisma.communityContent.count({ where: { status: "PUBLISHED" } }),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.partnerClick.count(),
  ]);

  const onboarded = await prisma.user.count({ where: { role: "STUDENT", onboarded: true } });
  const dropoff = users > 0 ? Math.round(((users - onboarded) / users) * 100) : 0;

  const stats = [
    ["Students", users],
    ["Quiz completions", onboarded],
    ["Onboarding drop-off", `${dropoff}%`],
    ["Applications", applications],
    ["Catalogue courses", courses],
    ["Service partners", partners],
    ["Published community items", community],
    ["Unread notifications sent", unread],
    ["Service click-throughs", partnerClicks],
  ] as const;

  return (
    <div className="stat-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      {stats.map(([label, value]) => (
        <div key={label} className="card">
          <div className="stat-num">{value}</div>
          <div className="stat-lbl">{label}</div>
        </div>
      ))}
    </div>
  );
}
