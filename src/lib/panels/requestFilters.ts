import type { RequestSummary } from "@/lib/data/requests";
import type { RequestStatus } from "@/lib/types/domain";
import { PRIORIDADE_ORDEM } from "@/lib/domain/prioridade";
import { inPeriod, isDate, matchesSearch, normalize, param, type SearchParams } from "./filters";

export type CaseStatus = "sem_ficha" | "aberto" | "encerrado";

export interface RequestFilters {
  q: string;
  prioridade: string; // urgente | alta | normal | a_avaliar
  caso: string; // ativos | sem_ficha | aberto | encerrado | todos
  status: string;
  categoria: string;
  municipio: string;
  campanha: string; // sim | nao
  de: string;
  ate: string;
  ordem: string; // prioridade | recentes | antigos
  pagina: string;
}

export function readRequestFilters(params: SearchParams, defaults: Partial<RequestFilters> = {}): RequestFilters {
  const get = (key: keyof RequestFilters) => param(params, key) || defaults[key] || "";
  return {
    q: get("q"),
    prioridade: get("prioridade"),
    caso: get("caso"),
    status: get("status"),
    categoria: get("categoria"),
    municipio: get("municipio"),
    campanha: get("campanha"),
    de: isDate(get("de")) ? get("de") : "",
    ate: isDate(get("ate")) ? get("ate") : "",
    ordem: get("ordem"),
    pagina: get("pagina"),
  };
}

export function priorityKey(request: RequestSummary): "urgente" | "alta" | "normal" | "a_avaliar" {
  return request.prioridadeSocial?.nivel ?? "a_avaliar";
}

function rank(request: RequestSummary): number {
  return PRIORIDADE_ORDEM[request.prioridadeSocial?.nivel ?? (request.urgente ? "urgente" : "normal")];
}

export function filterRequests(
  requests: RequestSummary[],
  f: RequestFilters,
  options: { caseStatus?: (request: RequestSummary) => CaseStatus; referredFirst?: boolean } = {},
): RequestSummary[] {
  const caseStatus = options.caseStatus ?? (() => "sem_ficha" as CaseStatus);
  const filtered = requests.filter((request) => {
    const ident = request.identificacao;
    if (f.prioridade && priorityKey(request) !== f.prioridade) return false;
    if (f.caso === "ativos" && caseStatus(request) === "encerrado") return false;
    if (f.caso && f.caso !== "ativos" && f.caso !== "todos" && caseStatus(request) !== f.caso) return false;
    if (f.status && request.status !== (f.status as RequestStatus)) return false;
    if (f.categoria && !(request.categorias ?? [request.categoria]).includes(f.categoria)) return false;
    if (f.municipio && normalize(ident?.municipio) !== normalize(f.municipio)) return false;
    if (f.campanha === "sim" && !request.encaminhamentoCampanha) return false;
    if (f.campanha === "nao" && request.encaminhamentoCampanha) return false;
    if (!inPeriod(request.criadoEm, f.de, f.ate)) return false;
    return matchesSearch(f.q, [
      request.requerenteNome,
      ident?.nome,
      ident?.nomeSocial,
      ident?.email,
      ident?.contato,
      ident?.territorio,
      ident?.municipio,
      request.titulo,
    ]);
  });

  return filtered.sort((a, b) => {
    if (f.ordem === "recentes") return b.criadoEm.localeCompare(a.criadoEm);
    if (f.ordem === "antigos") return a.criadoEm.localeCompare(b.criadoEm);
    // Padrão: (na curadoria) encaminhados pelo Serviço Social primeiro, depois prioridade e antiguidade.
    if (options.referredFirst && !!a.encaminhamentoCampanha !== !!b.encaminhamentoCampanha) {
      return a.encaminhamentoCampanha ? -1 : 1;
    }
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return a.criadoEm.localeCompare(b.criadoEm);
  });
}

export function hasActiveFilters(f: RequestFilters, defaults: Partial<RequestFilters> = {}): boolean {
  return (["q", "prioridade", "caso", "status", "categoria", "municipio", "campanha", "de", "ate", "ordem"] as const).some(
    (key) => f[key] && f[key] !== (defaults[key] ?? ""),
  );
}

export const PRIORIDADE_OPTIONS: Array<[string, string]> = [
  ["urgente", "Urgente"],
  ["alta", "Alta"],
  ["normal", "Normal"],
  ["a_avaliar", "A avaliar"],
];

export const ORDEM_OPTIONS: Array<[string, string]> = [
  ["recentes", "Mais recentes"],
  ["antigos", "Mais antigos"],
];
