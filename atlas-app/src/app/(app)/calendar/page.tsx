import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CalendarView } from "@/components/CalendarView";

export default async function CalendarPage() {
  const user = await requireUser();
  const [tasks, events] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id, dueAt: { not: null } } }),
    prisma.communityContent.findMany({ where: { type: "EVENT", status: "PUBLISHED", eventDate: { not: null } } }),
  ]);

  const items = [
    ...tasks.map((t) => ({ date: t.dueAt!.toISOString(), title: t.label, type: "task" as const })),
    ...events.map((e) => ({ date: e.eventDate!.toISOString(), title: e.title, type: "event" as const, href: `/community/event/${e.id}` })),
  ];

  return (
    <>
      <div className="j-head">
        <div>
          <h1>Calendar</h1>
          <p>Every deadline and event from your Journey board, in one place.</p>
        </div>
      </div>
      <CalendarView items={items} />
    </>
  );
}
