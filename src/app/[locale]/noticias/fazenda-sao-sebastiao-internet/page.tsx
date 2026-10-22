import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import Image from "next/image";
import { getPublicPageCopy } from "@/lib/data/content";

export const revalidate = 3600;

export default async function NoticiaFazendaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = await getPublicPageCopy("news", l);
  const paragraphs = [1, 2, 3, 4, 5].map((number) => t[`paragraph${number}`]);

  return (
    <main className="mx-auto w-full max-w-[860px] px-6 pb-16 pt-10">
      <article className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        {t.imageUrl && (
          <div className="relative mb-5 h-48 overflow-hidden rounded-xl sm:h-72">
            <Image src={t.imageUrl} alt={t.imageAlt} fill sizes="(min-width: 860px) 860px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="mb-4 inline-flex rounded-full bg-[#F2F7F3] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#2F6B4F]">
          {t.badge}
        </div>

        <h1 className="text-balance font-serif text-[clamp(28px,4.5vw,42px)] font-semibold text-[#173A2E]">
          {t.title}
        </h1>
        <p className="mt-2 text-[13px] font-semibold uppercase tracking-wider text-[#678477]">{t.date}</p>

        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#334B40]">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-[#E8D6B4] bg-[#FFF7E7] p-4 text-[#5D4A22]">
          <p className="font-semibold">{t.calloutTitle}</p>
          <p className="mt-1 text-[13px]">{t.calloutText}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${l}/doar`}
            className="rounded-xl bg-[#C8831F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AA6D15]"
          >
            {t.ctaSupport}
          </Link>
          <Link
            href={`/${l}`}
            className="rounded-xl border border-[#2A5D48]/25 bg-[#F2F7F3] px-5 py-3 text-sm font-semibold text-[#1A3E31] transition hover:border-[#2A5D48]"
          >
            {t.ctaBack}
          </Link>
        </div>
      </article>
    </main>
  );
}
