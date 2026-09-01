import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ShellChrome } from "@/components/shell/ShellChrome";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="screen">
      <div className="app">
        <ShellChrome
          userName={user.name ?? "You"}
          userImage={user.image}
          notifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        >
          {children}
        </ShellChrome>
      </div>
    </div>
  );
}
