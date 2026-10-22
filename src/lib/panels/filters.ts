// Utilitários dos painéis internos (Serviço Social, Curadoria, Voluntários, Usuários):
// leitura dos filtros da URL, busca sem acento e paginação. Os filtros ficam na URL para que
// uma visão (ex.: "urgentes de Rio Branco") possa ser salva ou compartilhada pela equipe.

export const PAGE_SIZE = 25;

export type SearchParams = Record<string, string | string[] | undefined>;

export function param(params: SearchParams, key: string): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value ?? "").trim();
}

// Minúsculas e sem acentos, para "Conceição" bater com "conceicao".
export function normalize(text: string | null | undefined): string {
  return (text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Busca em vários campos; números (telefone) também batem ignorando pontuação.
export function matchesSearch(query: string, fields: Array<string | null | undefined>): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(fields.filter(Boolean).join(" "));
  if (haystack.includes(q)) return true;
  const digits = q.replace(/\D/g, "");
  return digits.length >= 4 && fields.some((field) => (field ?? "").replace(/\D/g, "").includes(digits));
}

// Datas de filtro chegam como AAAA-MM-DD; "até" inclui o dia inteiro.
export function inPeriod(iso: string, from: string, to: string): boolean {
  if (from && iso < from) return false;
  if (to && iso > `${to}T23:59:59.999Z`) return false;
  return true;
}

export function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}

export function paginate<T>(items: T[], requestedPage: string, size = PAGE_SIZE): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(Math.max(1, Number.parseInt(requestedPage, 10) || 1), totalPages);
  return { items: items.slice((page - 1) * size, page * size), page, totalPages, total: items.length };
}

// Valores distintos de um campo, para montar as opções de um filtro (ex.: municípios).
export function distinctSorted(values: Array<string | null | undefined>): string[] {
  const byKey = new Map<string, string>();
  for (const value of values) {
    const clean = (value ?? "").trim();
    if (clean && !byKey.has(normalize(clean))) byKey.set(normalize(clean), clean);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
