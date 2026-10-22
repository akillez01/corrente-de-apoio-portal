import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import Image from "next/image";
import { getPublicPageCopy } from "@/lib/data/content";
import { getPublishedNews } from "@/lib/data/news";

export const revalidate = 60;

export default async function NoticiasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const [t, news] = await Promise.all([getPublicPageCopy("news", l), getPublishedNews()]);
  const dateFormat = new Intl.DateTimeFormat(l === "en" ? "en-US" : "pt-BR", { dateStyle: "long", timeZone: "UTC" });
  // A matéria da Fazenda São Sebastião é anterior ao cadastro de notícias e tem página própria.
  const articles = [
    ...news.map((article) => ({
      href: `noticias/${article.slug}`,
      title: article.titulo,
      date: dateFormat.format(new Date(`${article.dataPublicacao}T00:00:00Z`)),
      sortKey: article.dataPublicacao,
      summary: article.resumo,
      imageUrl: article.imageUrl,
      imageAlt: article.imageAlt,
    })),
    {
      href: "noticias/fazenda-sao-sebastiao-internet",
      title: t.title,
      date: t.date,
      sortKey: "2023-11-09",
      summary: t.paragraph1,
      imageUrl: t.imageUrl,
      imageAlt: t.imageAlt,
    },
  ].sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[860px]">
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{t.listEyebrow}</p>
        <h1 className="mt-3 font-serif text-[clamp(32px,5vw,56px)] font-medium leading-[1.05] tracking-[-.03em] text-[#16392D]">
          {t.listTitle}
        </h1>
        <p className="mt-5 text-base leading-7 text-[#4E6256] sm:text-lg">{t.listIntro}</p>

        <div className="mt-9 flex flex-col gap-4">
          {articles.map((article) => (
            <Link
              key={article.href}
              href={`/${l}/${article.href}`}
              className="group grid gap-5 rounded-2xl border border-[#E2E7DE] bg-white p-6 transition hover:border-[#2A6249]/40 hover:shadow-[0_12px_30px_rgba(24,54,41,.08)] sm:grid-cols-[200px_1fr]"
            >
              {article.imageUrl ? (
                <div className="relative h-40 overflow-hidden rounded-xl bg-[#EAE6D8] sm:h-full sm:min-h-[130px]">
                  <Image src={article.imageUrl} alt={article.imageAlt} fill sizes="200px" className="object-cover" />
                </div>
              ) : null}
              <div className={article.imageUrl ? "" : "sm:col-span-2"}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#678477]">{article.date}</p>
                <h2 className="mt-2 font-serif text-2xl font-medium text-[#1D4032]">{article.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5C6F63]">{article.summary}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-[#2A6249]">
                  {t.readMore} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
