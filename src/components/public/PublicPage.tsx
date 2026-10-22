import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";

export interface PublicPageCard {
  eyebrow?: string;
  title: string;
  text: string;
}

interface PublicPageProps {
  locale: Locale;
  eyebrow: string;
  title: string;
  intro: string;
  cards: PublicPageCard[];
  cta?: { label: string; href: string };
  note?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function PublicPage({
  locale,
  eyebrow,
  title,
  intro,
  cards,
  cta,
  note,
  imageUrl,
  imageAlt,
}: PublicPageProps) {
  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1080px]">
        {imageUrl && (
          <div className="relative mb-8 h-48 overflow-hidden rounded-3xl bg-[#EAE6D8] sm:h-72">
            <Image src={imageUrl} alt={imageAlt ?? ""} fill sizes="(min-width: 1024px) 1080px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="max-w-[790px]">
          <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-[clamp(36px,6vw,64px)] font-medium leading-[1.02] tracking-[-.035em] text-[#16392D]">
            {title}
          </h1>
          <p className="mt-5 max-w-[720px] text-[16px] leading-7 text-[#4E6256] sm:text-lg">{intro}</p>
          {cta && (
            <Link
              href={cta.href.startsWith("/") || cta.href.includes(":") ? cta.href : `/${locale}/${cta.href}`}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#BD8127] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9E6920]"
            >
              {cta.label}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[#E2E7DE] bg-white p-6 shadow-[0_12px_30px_rgba(24,54,41,.04)]"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF4EF] font-serif text-base text-[#2B644B]">
                {String(index + 1).padStart(2, "0")}
              </div>
              {card.eyebrow && (
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#A17D3B]">
                  {card.eyebrow}
                </p>
              )}
              <h2 className="font-serif text-xl font-medium text-[#1D4032]">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5C6F63]">{card.text}</p>
            </article>
          ))}
        </div>

        {note && (
          <p className="mt-7 rounded-xl border border-[#E7DDBF] bg-[#FFF9E9] px-5 py-4 text-sm leading-6 text-[#685835]">
            {note}
          </p>
        )}
      </div>
    </main>
  );
}
