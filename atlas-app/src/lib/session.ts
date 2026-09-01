import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Every (app) route needs a signed-in user with a finished quiz. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/auth");
  if (!user.onboarded) redirect("/onboarding");

  return user;
}

/** Auth/onboarding pages need to know who's signed in, but not bounce them. */
export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

/** Admin tooling (checklist §4) is role-gated, not just hidden behind a nav
 * link — an ADMIN-role check server-side, same as the stage engine. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/auth");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
