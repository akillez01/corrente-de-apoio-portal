import Link from "next/link";
import type { Page, SearchParams } from "@/lib/panels/filters";

// Componentes de servidor dos painéis: formulário de filtros (GET, funciona sem JavaScript),
// resumo da busca e paginação que preserva os filtros na URL.

export const FILTER_INPUT =
  "mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-primary";
export const FILTER_LABEL = "text-[12px] font-semibold text-muted";

export function FilterForm({
  action,
  children,
  hasFilters,
}: {
  action: string;
  children: React.ReactNode;
  hasFilters: boolean;
}) {
  return (
    <form action={action} className="mb-4 rounded-2xl border border-border bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white">
          Filtrar
        </button>
        {hasFilters && (
          <Link href={action} className="text-[13px] text-muted underline">
            Limpar filtros
          </Link>
        )}
      </div>
    </form>
  );
}

export function SelectFilter({
  name,
  label,
  value,
  options,
  emptyLabel = "Todos",
}: {
  name: string;
  label: string;
  value: string;
  options: Array<[string, string]>;
  emptyLabel?: string;
}) {
  return (
    <label className={FILTER_LABEL}>
      {label}
      <select name={name} defaultValue={value} className={FILTER_INPUT}>
        <option value="">{emptyLabel}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function hrefFor(action: string, params: SearchParams, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single && key !== "pagina") query.set(key, single);
  }
  if (page > 1) query.set("pagina", String(page));
  const qs = query.toString();
  return qs ? `${action}?${qs}` : action;
}

export function ResultSummary<T>({ page, totalAll, noun }: { page: Page<T>; totalAll: number; noun: string }) {
  return (
    <p className="mb-3 text-[12.5px] text-muted">
      {page.total === totalAll
        ? `${page.total} ${noun}`
        : `${page.total} de ${totalAll} ${noun} com os filtros aplicados`}
      {page.totalPages > 1 && ` · página ${page.page} de ${page.totalPages}`}
    </p>
  );
}

export function Pagination<T>({ action, params, page }: { action: string; params: SearchParams; page: Page<T> }) {
  if (page.totalPages <= 1) return null;
  const link = "rounded-lg border border-border bg-white px-3 py-1.5 text-[13px] font-semibold hover:border-primary";
  return (
    <nav aria-label="Paginação" className="mt-4 flex flex-wrap items-center justify-center gap-2">
      {page.page > 1 ? (
        <Link href={hrefFor(action, params, page.page - 1)} className={link}>
          ← Anterior
        </Link>
      ) : (
        <span className={`${link} opacity-40`}>← Anterior</span>
      )}
      <span className="px-2 text-[13px] text-muted">
        {page.page} / {page.totalPages}
      </span>
      {page.page < page.totalPages ? (
        <Link href={hrefFor(action, params, page.page + 1)} className={link}>
          Próxima →
        </Link>
      ) : (
        <span className={`${link} opacity-40`}>Próxima →</span>
      )}
    </nav>
  );
}
