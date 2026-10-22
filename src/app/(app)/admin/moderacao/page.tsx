import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getPointsByStatus, getProjectsByStatus } from "@/lib/data/network";
import { ModerationActions } from "@/components/admin/ModerationActions";
import type { ModerationStatus } from "@/lib/types/domain";

export const revalidate = 0;

const TABS: Array<[ModerationStatus, string]> = [
  ["pendente", "Aguardando"],
  ["aprovado", "Publicados"],
  ["reprovado", "Reprovados"],
];

export default async function ModeracaoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("editor_conteudo", "admin");
  const { status: statusParam } = await searchParams;
  const status = (TABS.find(([value]) => value === statusParam)?.[0] ?? "pendente") as ModerationStatus;
  const [projects, points] = await Promise.all([getProjectsByStatus(status), getPointsByStatus(status)]);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Projetos e pontos</h1>
      <p className="mb-4 text-[13px] text-muted">
        Cadastros enviados em Projetar e Integrar só aparecem no portal depois de aprovados aqui.
        Contatos privados (e-mail e telefone do responsável) nunca são publicados.
      </p>
      <div className="mb-5 flex gap-2">
        {TABS.map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/moderacao?status=${value}`}
            className={
              value === status
                ? "rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-white"
                : "rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:bg-bg"
            }
          >
            {label}
          </Link>
        ))}
      </div>

      <h2 className="mb-3 font-serif text-xl font-semibold">Projetos ({projects.length})</h2>
      <div className="mb-8 flex flex-col gap-3">
        {projects.length === 0 && <p className="text-[13px] text-muted">Nenhum projeto nesta situação.</p>}
        {projects.map((project) => (
          <article key={project.id} className="rounded-2xl border border-border bg-white p-4 text-[13px]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-semibold">{project.titulo}</h3>
                <p className="text-xs text-muted">
                  {project.local} · enviado em {new Date(project.criadoEm).toLocaleDateString("pt-BR")}
                  {project.moderadoPor ? ` · moderado por ${project.moderadoPor}` : ""}
                </p>
              </div>
              <ModerationActions tipo="projeto" id={project.id} status={status} />
            </div>
            <p className="mt-2 font-semibold">{project.resumo}</p>
            <p className="mt-1 whitespace-pre-line text-muted">{project.descricao}</p>
            <p className="mt-2">Apoio: {project.apoiosNecessarios.join(", ")}</p>
            <p className="mt-2 border-t border-border pt-2 text-xs text-muted">
              Responsável: {project.responsavelNome} · {project.responsavelEmail}
              {project.responsavelTelefone ? ` · ${project.responsavelTelefone}` : ""}
              {project.linkExterno ? ` · ${project.linkExterno}` : ""}
              {status === "aprovado" && (
                <>
                  {" · "}
                  <Link href={`/pt/projetar/${project.slug}`} className="text-primary underline">
                    ver página pública
                  </Link>
                </>
              )}
            </p>
          </article>
        ))}
      </div>

      <h2 className="mb-3 font-serif text-xl font-semibold">Pontos do Santo Daime ({points.length})</h2>
      <div className="flex flex-col gap-3">
        {points.length === 0 && <p className="text-[13px] text-muted">Nenhum ponto nesta situação.</p>}
        {points.map((point) => (
          <article key={point.id} className="rounded-2xl border border-border bg-white p-4 text-[13px]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-semibold">{point.nome}</h3>
                <p className="text-xs text-muted">
                  {[point.municipio, point.estado, point.pais].filter(Boolean).join(" · ")} · enviado em{" "}
                  {new Date(point.criadoEm).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <ModerationActions tipo="ponto" id={point.id} status={status} />
            </div>
            <p className="mt-2">{point.localizacao}</p>
            <p className="mt-1">Acolhimento: {point.contatoAcolhimento}</p>
            {point.siteOuInstagram && <p className="mt-1">{point.siteOuInstagram}</p>}
            <p className="mt-2 border-t border-border pt-2 text-xs text-muted">Cadastrado por: {point.cadastradoPorEmail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
