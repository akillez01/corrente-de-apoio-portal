import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getVolunteers, VOLUNTEER_DIRECTORY_ROLES } from "@/lib/data/volunteers";
import { AREA_LABELS, AREAS_ATUACAO, MODALIDADES, OFERTAS } from "@/lib/domain/voluntariado";
import { distinctSorted, matchesSearch, normalize, paginate, param, type SearchParams } from "@/lib/panels/filters";
import { Pagination, ResultSummary } from "@/components/panels/PanelControls";

export const revalidate = 0;

const SELECT = "rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary";

export default async function VoluntariosEquipePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole(...VOLUNTEER_DIRECTORY_ROLES);
  const params = await searchParams;
  const area = param(params, "area");
  const oferta = param(params, "oferta");
  const cidade = param(params, "cidade");
  const modalidade = param(params, "modalidade");
  const q = param(params, "q");
  const all = await getVolunteers();
  const page = paginate(
    all.filter(
      (v) =>
        (!area || v.areasAtuacao.includes(area)) &&
        (!oferta || v.ofertas.includes(oferta)) &&
        (!cidade || normalize(v.cidade) === normalize(cidade)) &&
        (!modalidade || v.modalidade === modalidade) &&
        matchesSearch(q, [v.nome, v.email, v.telefone, v.cidade, v.estado, v.profissao, v.formacao, v.habilidades, v.detalhesOferta]),
    ),
    param(params, "pagina"),
  );
  const volunteers = page.items;

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Voluntários do Daime</h1>
      <p className="mb-5 text-[13px] text-muted">
        🔒 Cadastro geral, visível só para a equipe. Use os contatos apenas para chamados de voluntariado.
      </p>

      <form className="mb-5 flex flex-wrap items-end gap-2.5 rounded-2xl border border-border bg-white p-4">
        <label className="text-[12px] font-semibold text-muted">
          Área
          <select name="area" defaultValue={area} className={`${SELECT} mt-1 block`}>
            <option value="">Todas</option>
            {AREAS_ATUACAO.map((value) => (
              <option key={value} value={value}>
                {AREA_LABELS[value].pt}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] font-semibold text-muted">
          Pode oferecer
          <select name="oferta" defaultValue={oferta} className={`${SELECT} mt-1 block`}>
            <option value="">Tudo</option>
            {OFERTAS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] font-semibold text-muted">
          Cidade
          <select name="cidade" defaultValue={cidade} className={`${SELECT} mt-1 block`}>
            <option value="">Todas</option>
            {distinctSorted(all.map((v) => v.cidade)).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] font-semibold text-muted">
          Modalidade
          <select name="modalidade" defaultValue={modalidade} className={`${SELECT} mt-1 block`}>
            <option value="">Todas</option>
            {MODALIDADES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[200px] flex-1 text-[12px] font-semibold text-muted">
          Buscar
          <input name="q" defaultValue={q} placeholder="Nome, cidade, profissão, habilidade…" className={`${SELECT} mt-1 block w-full`} />
        </label>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white">
          Filtrar
        </button>
        {(area || oferta || q || cidade || modalidade) && (
          <Link href="/voluntarios" className="px-2 py-2 text-[13px] text-muted underline">
            Limpar
          </Link>
        )}
      </form>

      <ResultSummary page={page} totalAll={all.length} noun="voluntário(s)" />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {volunteers.map((v) => (
          <article key={v.id} className="rounded-2xl border border-border bg-white p-4 text-[13px]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-serif text-lg font-semibold">{v.nome}</h2>
                <p className="text-xs text-muted">
                  {[v.cidade, v.estado, v.pais].filter(Boolean).join(" · ")}
                  {v.modalidade ? ` · ${v.modalidade}` : ""}
                </p>
              </div>
              <span className="text-[11px] text-muted">
                desde {v.criadoEm ? new Date(v.criadoEm).toLocaleDateString("pt-BR") : "—"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {v.areasAtuacao.map((value) => (
                <span key={value} className="rounded-full bg-[#E3EEFB] px-2 py-0.5 text-[11.5px] text-[#2B5AA0]">
                  {AREA_LABELS[value]?.pt ?? value}
                </span>
              ))}
              {v.ofertas.map((value) => (
                <span key={value} className="rounded-full bg-bg px-2 py-0.5 text-[11.5px]">
                  {value}
                </span>
              ))}
            </div>
            {(v.profissao || v.formacao) && (
              <p className="mt-2">{[v.profissao, v.formacao].filter(Boolean).join(" · ")}</p>
            )}
            <p className="mt-1 text-muted">{v.habilidades}</p>
            {v.detalhesOferta && <p className="mt-1 text-muted">{v.detalhesOferta}</p>}
            {v.disponibilidade && <p className="mt-1 text-xs text-muted">Disponibilidade: {v.disponibilidade}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-[12.5px]">
              <a href={`mailto:${v.email}`} className="text-primary underline">{v.email}</a>
              <span>
                {v.telefone}
                {v.formaContato ? ` (prefere ${v.formaContato})` : ""}
              </span>
              {v.documentoPath && (
                <a href={`/api/voluntarios/${v.id}/documento`} className="text-primary underline">
                  📎 {v.documentoNome}
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      <Pagination action="/voluntarios" params={params} page={page} />
    </div>
  );
}
