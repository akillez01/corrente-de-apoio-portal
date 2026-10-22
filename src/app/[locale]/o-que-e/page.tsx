import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";
import { getPublicPageCopy } from "@/lib/data/content";

export const revalidate = 60;

export default async function OQueEPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = await getPublicPageCopy("about", l);
  const cards = Array.from({ length: 6 }, (_, index) => ({
    eyebrow: t[`card${index + 1}Eyebrow`],
    title: t[`card${index + 1}Title`],
    text: t[`card${index + 1}Text`],
  }));

  return (
    <main className="bg-[#F8F7F1] px-5 py-12 text-[#193B2F] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-[1180px]">
        {t.imageUrl && (
          <div className="relative mb-10 h-48 overflow-hidden rounded-3xl bg-[#EAE6D8] sm:h-72">
            <Image src={t.imageUrl} alt={t.imageAlt} fill sizes="(min-width: 1180px) 1180px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#A17D3B]">
            {t.eyebrow}
          </p>
          <h1 className="mt-4 text-balance font-serif text-[clamp(36px,5vw,60px)] font-medium leading-tight tracking-[-.03em]">
            {t.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-[#56695D] sm:text-lg">{t.intro}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[#E5E5D8] bg-white/70 p-6 sm:p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#A17D3B]">
                {String(index + 1).padStart(2, "0")}
                {card.eyebrow && ` · ${card.eyebrow}`}
              </p>
              <h2 className="mt-4 font-serif text-xl font-medium leading-snug text-[#193B2F]">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#56695D]">{card.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-6 text-center">
          <p className="max-w-[800px] font-serif text-xl font-medium leading-8 text-[#2A6249] sm:text-2xl">
            {t.closing}
          </p>
          <Link
            href={`/${l}/voluntariar`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2A6249] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1F4E39]"
          >
            {t.ctaLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
