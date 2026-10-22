import { ContentEditorForm } from "@/components/admin/ContentEditorForm";
import { requireRole } from "@/lib/auth/session";
import { getPublicPageCopy } from "@/lib/data/content";
import { locales, type Locale } from "@/lib/i18n/config";
import {
  isPublicPageId,
  PUBLIC_PAGE_IDS,
  PUBLIC_PAGE_LABELS,
  type PublicPageId,
} from "@/lib/types/siteContent";
import Link from "next/link";

export const revalidate = 0;

const LOCALE_LABEL: Record<Locale, string> = { pt: "Portugues", en: "English" };

export default async function AdminConteudoPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string; page?: string }>;
}) {
  await requireRole("editor_conteudo", "admin");
  const { locale: localeParam, page: pageParam } = await searchParams;
  const locale: Locale = locales.includes(localeParam as Locale) ? (localeParam as Locale) : "pt";
  const pageId: PublicPageId = isPublicPageId(pageParam) ? pageParam : "home";
  const content = await getPublicPageCopy(pageId, locale);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Conteúdo do site</h1>
      <p className="mb-4 text-[13px] text-muted">
        Edite os textos e imagens das páginas públicas. Alterações são publicadas ao salvar;
        cada idioma possui conteúdo próprio. Textos de consentimento e operações internas são protegidos.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {PUBLIC_PAGE_IDS.map((id) => (
          <Link
            key={id}
            href={`/admin/conteudo?page=${id}&locale=${locale}`}
            className={
              id === pageId
                ? "rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-white"
                : "rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:bg-bg"
            }
          >
            {PUBLIC_PAGE_LABELS[id]}
          </Link>
        ))}
      </div>
      <div className="mb-5 flex gap-2">
        {locales.map((l) => (
          <Link
            key={l}
            href={`/admin/conteudo?page=${pageId}&locale=${l}`}
            className={
              l === locale
                ? "rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-white"
                : "rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:bg-bg"
            }
          >
            {LOCALE_LABEL[l]}
          </Link>
        ))}
      </div>
      <ContentEditorForm key={`${pageId}-${locale}`} pageId={pageId} locale={locale} initialContent={content} />
    </div>
  );
}
