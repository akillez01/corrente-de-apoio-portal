import Link from "next/link";
import type { SessionUser } from "@/lib/auth/session";
import { LogoutButton } from "./LogoutButton";

const ROLE_LABEL: Record<string, string> = {
  curador: "curadoria",
  financeiro: "financeiro",
  admin: "admin",
  requerente: "requerente",
};

const NAV: { href: string; label: string; roles: string[] }[] = [
  { href: "/curadoria", label: "Curadoria", roles: ["curador", "admin"] },
  { href: "/financeiro", label: "Financeiro", roles: ["financeiro", "admin"] },
  { href: "/meus-pedidos", label: "Meus pedidos", roles: ["requerente"] },
  { href: "/admin/usuarios", label: "Usuários", roles: ["admin"] },
];

export function AppHeader({ user }: { user: SessionUser }) {
  const items = NAV.filter((item) => user.role && item.roles.includes(user.role));

  return (
    <header className="bg-header text-white">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-3 px-6 py-3">
        <Link href="/pt" className="font-serif text-base font-semibold">
          Corrente de Apoio
        </Link>
        <nav className="flex flex-wrap gap-1 text-[13px]">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-2.5 py-1.5 opacity-90 hover:opacity-100">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] font-medium">
            {user.nome ?? user.email} · {user.role ? ROLE_LABEL[user.role] : "sem papel"}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
