import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPageCopy } from "@/lib/data/content";
import { getPublishedNewsBySlug } from "@/lib/data/news";

export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedNewsBySlug(slug);
  return article ? { title: article.titulo, description: article.resumo } : {};
}

export default async function NoticiaPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const l = locale as Locale;
  const [t, article] = await Promise.all([getPublicPageCopy("news", l), getPublishedNewsBySlug(slug)]);
  if (!article) notFound();
  const date = new Intl.DateTimeFormat(l === "en" ? "en-US" : "pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${article.dataPublicacao}T00:00:00Z`),
  );

  return (
    <main className="mx-auto w-full max-w-[860px] px-6 pb-16 pt-10">
      <Link href={`/${l}/noticias`} className="text-[13px] text-[#5C6F63] hover:text-[#16392D]">
        ← {t.listEyebrow}
      </Link>
      <article className="mt-4 rounded-2xl border border-border bg-white p-6 sm:p-8">
        {article.imageUrl && (
          <div className="relative mb-5 h-48 overflow-hidden rounded-xl sm:h-80">
            <Image src={article.imageUrl} alt={article.imageAlt} fill sizes="(min-width: 860px) 860px, 100vw" className="object-cover" />
          </div>
        )}
        <h1 className="text-balance font-serif text-[clamp(28px,4.5vw,42px)] font-semibold text-[#173A2E]">{article.titulo}</h1>
        <p className="mt-2 text-[13px] font-semibold uppercase tracking-wider text-[#678477]">{date}</p>
        <p className="mt-5 text-lg leading-8 text-[#3C584A]">{article.resumo}</p>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#334B40]">
          {article.corpo.split(/\n{2,}/).map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">{paragraph}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${l}/doar`} className="rounded-xl bg-[#C8831F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AA6D15]">
            {t.ctaSupport}
          </Link>
        </div>
      </article>
    </main>
  );
}
