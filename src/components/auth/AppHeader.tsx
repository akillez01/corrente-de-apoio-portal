import type { SessionUser } from "@/lib/auth/session";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

const ROLE_LABEL: Record<string, string> = {
  curador: "curadoria",
  assistente_social: "serviço social",
  financeiro: "financeiro",
  editor_conteudo: "editor de conteúdo",
  admin: "admin",
  requerente: "requerente",
};

const NAV: { href: string; label: string; roles: string[] }[] = [
  { href: "/curadoria", label: "Curadoria", roles: ["curador", "admin"] },
  { href: "/servico-social", label: "Serviço Social", roles: ["assistente_social", "admin"] },
  { href: "/voluntarios", label: "Voluntários", roles: ["curador", "assistente_social", "admin"] },
  { href: "/financeiro", label: "Financeiro", roles: ["financeiro", "admin"] },
  { href: "/meus-pedidos", label: "Meus pedidos", roles: ["requerente"] },
  { href: "/admin/usuarios", label: "Usuários", roles: ["admin"] },
  { href: "/admin/conteudo", label: "Conteúdo do site", roles: ["editor_conteudo", "admin"] },
  { href: "/admin/campanhas", label: "Publicar campanhas", roles: ["admin"] },
  { href: "/admin/moderacao", label: "Projetos e pontos", roles: ["editor_conteudo", "admin"] },
  { href: "/admin/noticias", label: "Notícias", roles: ["editor_conteudo", "admin"] },
  { href: "/admin/atendimentos", label: "Assistente", roles: ["admin"] },
];

export function AppHeader({ user }: { user: SessionUser }) {
  const items = NAV.filter((item) => user.role && item.roles.includes(user.role));

  return (
    <header className="bg-header text-white">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <Link href="/pt" className="font-serif text-base font-semibold">
          Daime Solidariedade
        </Link>
        <nav className="flex flex-wrap gap-1 text-[13px]">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-2.5 py-1.5 opacity-90 hover:opacity-100">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="max-w-[42vw] truncate rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-medium sm:max-w-none sm:px-3 sm:text-[11.5px]">
            {user.nome ?? user.email} · {user.role ? ROLE_LABEL[user.role] : "sem papel"}
          </span>
          <Link href="/conta" className="rounded-lg px-2.5 py-1.5 text-[12.5px] opacity-90 hover:opacity-100">
            Minha conta
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
