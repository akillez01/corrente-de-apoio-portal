import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";
import { getPublicPageCopy } from "@/lib/data/content";

export const revalidate = 60;

export default async function MulheresApoioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = await getPublicPageCopy("women-support", l);

  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1080px]">
        {t.imageUrl && (
          <div className="relative mb-8 h-48 overflow-hidden rounded-3xl bg-[#EAE6D8] sm:h-72">
            <Image src={t.imageUrl} alt={t.imageAlt} fill sizes="(min-width: 1080px) 1080px, 100vw" className="object-cover" />
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{t.eyebrow}</p>
        <h1 className="mt-3 font-serif text-[clamp(36px,6vw,64px)] font-medium leading-[1.02] tracking-[-.035em] text-[#16392D]">
          {t.title}
        </h1>
        <p className="mt-5 max-w-[720px] text-base leading-7 text-[#4E6256] sm:text-lg">{t.intro}</p>

        <section className="mt-8 rounded-2xl border border-[#E8C3B4] bg-[#FFF3EE] p-5 sm:p-6">
          <h2 className="font-serif text-xl font-medium text-[#8A3A1E]">{t.emergencyTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B3622]">{t.emergencyText}</p>
        </section>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <section className="flex flex-col rounded-2xl border border-[#E2E7DE] bg-white p-6">
            <h2 className="font-serif text-xl font-medium text-[#1D4032]">{t.supportTitle}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-[#5C6F63]">{t.supportText}</p>
            <Link
              href={`/${l}/preciso-de-ajuda`}
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#BD8127] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9E6920]"
            >
              {t.supportCta}
              <span aria-hidden="true">→</span>
            </Link>
          </section>
          <section className="flex flex-col rounded-2xl border border-[#E2E7DE] bg-white p-6">
            <h2 className="font-serif text-xl font-medium text-[#1D4032]">{t.contactTitle}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-[#5C6F63]">{t.contactText}</p>
            <a
              href={`mailto:${t.contactEmail}`}
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#2A6249]/40 px-5 py-3 text-sm font-semibold text-[#2A6249] transition hover:bg-[#EFF4EF]"
            >
              {t.contactCta}
            </a>
            <p className="mt-2 text-xs text-[#5C6F63]">{t.contactEmail}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
