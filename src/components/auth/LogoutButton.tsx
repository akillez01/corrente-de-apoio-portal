"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-white/20 px-3 py-1.5 text-[12.5px] font-medium text-white/90 transition hover:bg-white/10"
    >
      Sair
    </button>
  );
}
