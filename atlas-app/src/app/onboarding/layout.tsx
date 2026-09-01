import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/auth");
  if (user.onboarded) redirect("/");
  return children;
}
