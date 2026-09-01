import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { MessagesView } from "@/components/MessagesView";

export default async function MessagesPage() {
  const user = await requireUser();
  const threads = await prisma.messageThread.findMany({
    where: { userId: user.id },
    include: { advisor: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <MessagesView
      threads={threads.map((t) => ({
        id: t.id,
        advisor: { name: t.advisor.name, jobTitle: t.advisor.jobTitle, image: t.advisor.image },
        messages: t.messages.map((m) => ({
          id: m.id,
          body: m.body,
          own: m.fromUserId === user.id,
          createdAt: m.createdAt.toISOString(),
        })),
      }))}
    />
  );
}
