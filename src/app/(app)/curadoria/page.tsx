import { KpiCard } from "@/components/dashboard/KpiCard";
import { PrioridadeBadge } from "@/components/servicoSocial/PrioridadeBadge";
import { StatusChip } from "@/components/StatusChip";
import { requireRole } from "@/lib/auth/session";
import { getRequestSummaries } from "@/lib/data/requests";
import {
  FILTER_INPUT,
  FILTER_LABEL,
  FilterForm,
  Pagination,
  ResultSummary,
  SelectFilter,
} from "@/components/panels/PanelControls";
import { CATEGORIAS_DEMANDA } from "@/lib/domain/acolhimento";
import { distinctSorted, paginate, type SearchParams } from "@/lib/panels/filters";
import {
  filterRequests,
  hasActiveFilters,
  ORDEM_OPTIONS,
  PRIORIDADE_OPTIONS,
  readRequestFilters,
} from "@/lib/panels/requestFilters";
import { formatBRL } from "@/lib/format";
import Link from "next/link";

export const revalidate = 0;

export default async function CuradoriaFilaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireRole("curador", "admin");
  const params = await searchParams;
  const aprovado = params.aprovado;
  const f = readRequestFilters(params);
  const requests = await getRequestSummaries({ statuses: ["submetido", "em_analise", "em_alinhamento"] });
  const page = paginate(filterRequests(requests, f, { referredFirst: !f.ordem }), f.pagina);
  const urgentes = requests.filter((request) => request.urgente).length;
  const emAlinhamento = requests.filter((request) => request.status === "em_alinhamento").length;
  const metaFila = requests.reduce((acc, request) => acc + request.meta, 0);
  const pendentesIniciais = requests.filter(
    (request) => request.status === "submetido" || request.status === "em_analise",
  ).length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3.5">
        <h1 className="font-serif text-2xl font-semibold">Fila de triagem</h1>
        <span className="rounded-full border border-[#EBD9A8] bg-[#FDF3DC] px-2.5 py-1 text-[11.5px] font-semibold text-[#8A6414]">
          Sessão: {user.nome} · curadoria
        </span>
      </div>

      {aprovado && (
        <p role="status" className="mb-5 rounded-xl border border-[#CFE3D6] bg-[#EFF7F1] p-4 text-[13px] text-[#1F4E39]">
          Campanha aprovada. Ela ainda <b>não está no site</b>: o admin precisa publicá-la em
          “Publicar campanhas”.
        </p>
      )}

      <div className="mb-5 flex gap-2.5 rounded-xl border border-[#EBD9A8] bg-[#FDF3DC] p-4 text-[13px] text-[#6B4E10]">
        <span>⚠</span>
        <span>
          Laudos e documentos anexados aos pedidos são visíveis apenas nesta área, para
          curadoria e admin. Nada vai ao ar sem aprovação e sem revisão do texto público
          junto ao requerente.
        </span>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Fila ativa" value={String(requests.length)} />
        <KpiCard label="Pedidos urgentes" value={String(urgentes)} />
        <KpiCard label="Em alinhamento" value={String(emAlinhamento)} />
        <KpiCard
          label="Meta em analise"
          value={`R$ ${formatBRL(metaFila)}`}
          hint={`${pendentesIniciais} pedido(s) aguardando primeira conclusao`}
        />
      </div>

      <FilterForm action="/curadoria" hasFilters={hasActiveFilters(f)}>
        <label className={`${FILTER_LABEL} sm:col-span-2`}>
          Buscar
          <input name="q" defaultValue={f.q} placeholder="Nome, e-mail, telefone, território ou título" className={FILTER_INPUT} />
        </label>
        <SelectFilter name="prioridade" label="Prioridade (Serviço Social)" value={f.prioridade} options={PRIORIDADE_OPTIONS} emptyLabel="Todas" />
        <SelectFilter
          name="status"
          label="Estado"
          value={f.status}
          options={[
            ["submetido", "Submetido"],
            ["em_analise", "Em análise"],
            ["em_alinhamento", "Em alinhamento"],
          ]}
        />
        <SelectFilter
          name="campanha"
          label="Origem"
          value={f.campanha}
          options={[
            ["sim", "Encaminhados pelo Serviço Social"],
            ["nao", "Sem encaminhamento"],
          ]}
        />
        <SelectFilter name="categoria" label="Categoria" value={f.categoria} emptyLabel="Todas" options={CATEGORIAS_DEMANDA.map((c) => [c, c])} />
        <SelectFilter
          name="municipio"
          label="Município"
          value={f.municipio}
          options={distinctSorted(requests.map((r) => r.identificacao?.municipio)).map((m) => [m, m])}
        />
        <SelectFilter name="ordem" label="Ordenar por" value={f.ordem} emptyLabel="Encaminhados e prioridade" options={ORDEM_OPTIONS} />
      </FilterForm>

      <ResultSummary page={page} totalAll={requests.length} noun="pedido(s) na fila" />

      {page.items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">
          {requests.length === 0 ? "Nenhum pedido na fila no momento." : "Nenhum pedido encontrado com estes filtros."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="grid grid-cols-[2.2fr_.8fr_.9fr_.9fr_auto] gap-3 bg-bg px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span>Pedido</span>
            <span>Categoria</span>
            <span>Meta sugerida</span>
            <span>Estado</span>
            <span />
          </div>
          {page.items.map((request) => (
            <div
              key={request.id}
              className="grid grid-cols-[2.2fr_.8fr_.9fr_.9fr_auto] items-center gap-3 border-b border-border px-4.5 py-3.5 text-[13.5px] last:border-b-0"
            >
              <div>
                <div className="font-semibold">{request.titulo}</div>
                <div className="text-xs text-muted">{request.requerenteNome}</div>
                <PrioridadeBadge request={request} />
                {request.encaminhamentoCampanha && (
                  <span className="mt-1 inline-block rounded-full bg-[#E3EEFB] px-2 py-0.5 text-[11px] font-semibold text-[#2B5AA0]">
                    Encaminhado pelo Serviço Social
                  </span>
                )}
              </div>
              <div className="text-muted">{request.categoria}</div>
              <div className="font-mono text-[12.5px]">{request.meta > 0 ? `R$ ${formatBRL(request.meta)}` : "a definir"}</div>
              <div>
                <StatusChip status={request.status} />
              </div>
              <Link
                href={`/curadoria/${request.id}`}
                className="whitespace-nowrap rounded-lg border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-semibold transition hover:border-primary"
              >
                {request.status === "em_alinhamento" ? "Continuar" : "Analisar"}
              </Link>
            </div>
          ))}
        </div>
      )}

      <Pagination action="/curadoria" params={params} page={page} />

      <p className="mt-3.5 text-[12.5px] text-muted">
        Fluxo: submetido → análise/alinhamento → aprovação da curadoria → publicação pelo admin
        em “Publicar campanhas”. Só campanhas publicadas aparecem no portal.
      </p>
    </div>
  );
}
