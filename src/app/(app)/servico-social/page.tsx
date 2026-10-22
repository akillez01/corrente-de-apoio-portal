import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getRequestSummaries } from "@/lib/data/requests";
import { getSocialCaseSummaries } from "@/lib/data/socialCases";
import {
  RESULTADO_LABEL,
  RESULTADOS_ENCERRAMENTO,
  RESULTADOS_POSITIVOS,
  isResultado,
} from "@/lib/domain/encerramento";
import { param } from "@/lib/panels/filters";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PrioridadeBadge } from "@/components/servicoSocial/PrioridadeBadge";
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
  type CaseStatus,
} from "@/lib/panels/requestFilters";

export const revalidate = 0;

const CASE_LABEL: Record<CaseStatus, { label: string; className: string }> = {
  sem_ficha: { label: "Aguardando acolhimento", className: "bg-[#FDF3DC] text-[#8A6414]" },
  aberto: { label: "Em acompanhamento", className: "bg-[#E3EEFB] text-[#2B5AA0]" },
  encerrado: { label: "Encerrado", className: "bg-[#F0F0F0] text-[#555555]" },
};

const DEFAULTS = { caso: "ativos" };

export default async function ServicoSocialPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireRole("assistente_social", "admin");
  const params = await searchParams;
  const f = readRequestFilters(params, DEFAULTS);
  const resultado = param(params, "resultado");
  const [all, cases] = await Promise.all([
    getRequestSummaries({ desde: f.de || undefined }),
    getSocialCaseSummaries(),
  ]);
  const requests = all.filter((request) => request.status !== "arquivado");
  const caseStatus = (request: { id: string }): CaseStatus => cases.get(request.id)?.status ?? "sem_ficha";
  // Filtrar por resultado só faz sentido entre os encerrados.
  if (resultado && f.caso === "ativos") f.caso = "encerrado";
  const filtered = filterRequests(requests, f, { caseStatus }).filter(
    (request) => !resultado || cases.get(request.id)?.resultado === resultado,
  );
  const page = paginate(filtered, f.pagina);
  const tab = f.caso === "encerrado" ? "encerrado" : f.caso === "todos" ? "todos" : "ativos";
  const count = (status: CaseStatus) => requests.filter((request) => caseStatus(request) === status).length;
  const urgentesSemFicha = requests.filter(
    (request) =>
      caseStatus(request) === "sem_ficha" &&
      (request.prioridadeSocial?.nivel ?? (request.urgente ? "urgente" : "")) === "urgente",
  ).length;

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Serviço Social</h1>
      <p className="mb-5 text-[13px] text-muted">
        🔒 Área restrita às assistentes sociais. Dados sigilosos — use apenas para a intervenção social.
      </p>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Aguardando acolhimento" value={String(count("sem_ficha"))} />
        <KpiCard label="Urgentes aguardando" value={String(urgentesSemFicha)} />
        <KpiCard label="Em acompanhamento" value={String(count("aberto"))} />
        <KpiCard label="Encerrados" value={String(count("encerrado"))} />
      </div>

      <nav aria-label="Situação dos atendimentos" className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["ativos", "Ativos", "/servico-social"],
            ["encerrado", `Encerrados (${count("encerrado")})`, "/servico-social?caso=encerrado"],
            ["todos", "Todos", "/servico-social?caso=todos"],
          ] as const
        ).map(([key, label, href]) => (
          <Link
            key={key}
            href={href}
            className={
              tab === key
                ? "rounded-lg bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-white"
                : "rounded-lg border border-border bg-white px-3.5 py-1.5 text-[13px] font-semibold text-muted hover:border-primary"
            }
          >
            {label}
          </Link>
        ))}
      </nav>

      <FilterForm action="/servico-social" hasFilters={hasActiveFilters(f, DEFAULTS) || Boolean(resultado)}>
        <label className={`${FILTER_LABEL} sm:col-span-2`}>
          Buscar pessoa
          <input name="q" defaultValue={f.q} placeholder="Nome, nome social, e-mail, telefone ou território" className={FILTER_INPUT} />
        </label>
        <SelectFilter name="prioridade" label="Prioridade" value={f.prioridade} options={PRIORIDADE_OPTIONS} emptyLabel="Todas" />
        <SelectFilter
          name="caso"
          label="Atendimento"
          value={f.caso === "ativos" ? "" : f.caso}
          emptyLabel="Ativos (não encerrados)"
          options={[
            ["sem_ficha", "Aguardando acolhimento"],
            ["aberto", "Em acompanhamento"],
            ["encerrado", "Encerrados"],
            ["todos", "Todos"],
          ]}
        />
        <SelectFilter
          name="categoria"
          label="Categoria"
          value={f.categoria}
          emptyLabel="Todas"
          options={CATEGORIAS_DEMANDA.map((c) => [c, c])}
        />
        <SelectFilter
          name="municipio"
          label="Município"
          value={f.municipio}
          options={distinctSorted(requests.map((r) => r.identificacao?.municipio)).map((m) => [m, m])}
        />
        <SelectFilter
          name="campanha"
          label="Campanha"
          value={f.campanha}
          options={[
            ["sim", "Encaminhados para campanha"],
            ["nao", "Não encaminhados"],
          ]}
        />
        <SelectFilter
          name="resultado"
          label="Resultado (encerrados)"
          value={isResultado(resultado) ? resultado : ""}
          options={RESULTADOS_ENCERRAMENTO.map(([value, label]) => [value, label])}
        />
        <SelectFilter name="ordem" label="Ordenar por" value={f.ordem} emptyLabel="Prioridade" options={ORDEM_OPTIONS} />
        <label className={FILTER_LABEL}>
          Recebido de
          <input type="date" name="de" defaultValue={f.de} className={FILTER_INPUT} />
        </label>
        <label className={FILTER_LABEL}>
          até
          <input type="date" name="ate" defaultValue={f.ate} className={FILTER_INPUT} />
        </label>
      </FilterForm>

      <ResultSummary page={page} totalAll={requests.length} noun="cadastro(s)" />

      {page.items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">
          Nenhum cadastro encontrado com estes filtros.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {page.items.map((request) => {
            const status = caseStatus(request);
            return (
              <Link
                key={request.id}
                href={`/servico-social/${request.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-primary"
              >
                <div className="min-w-0">
                  <div className="font-semibold">
                    {request.identificacao?.nomeSocial || request.requerenteNome}
                    {request.encaminhamentoCampanha && (
                      <span className="ml-2 rounded-full bg-[#E3EEFB] px-2 py-0.5 text-[11px] font-semibold text-[#2B5AA0]">
                        campanha
                      </span>
                    )}
                    <PrioridadeBadge request={request} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {(request.categorias ?? [request.categoria]).join(", ")}
                    {request.identificacao?.municipio ? ` · ${request.identificacao.municipio}` : ""} · recebido em{" "}
                    {new Date(request.criadoEm).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${CASE_LABEL[status].className}`}>
                    {CASE_LABEL[status].label}
                  </span>
                  {status === "encerrado" && (
                    <span
                      className={`text-[11.5px] font-semibold ${
                        RESULTADOS_POSITIVOS.includes(cases.get(request.id)?.resultado as never)
                          ? "text-primary"
                          : "text-muted"
                      }`}
                    >
                      {isResultado(cases.get(request.id)?.resultado)
                        ? RESULTADO_LABEL[cases.get(request.id)?.resultado as keyof typeof RESULTADO_LABEL]
                        : "Resultado não informado"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination action="/servico-social" params={params} page={page} />
    </div>
  );
}
