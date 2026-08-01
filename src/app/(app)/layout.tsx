import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { AppHeader } from "@/components/auth/AppHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader user={user} />
      <div className="mx-auto max-w-[1080px] px-6 py-7">{children}</div>
    </div>
  );
}
