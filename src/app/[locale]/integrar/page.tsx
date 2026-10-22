import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import { getPublicPageCopy } from "@/lib/data/content";
import { getPointsByStatus } from "@/lib/data/network";
import { PontoForm } from "@/components/rede/PontoForm";
import type { DaimePoint } from "@/lib/types/domain";

export const revalidate = 60;

export default async function IntegrarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const [t, points] = await Promise.all([getPublicPageCopy("integrate", l), getPointsByStatus("aprovado")]);
  const byCountry = new Map<string, DaimePoint[]>();
  for (const point of points) {
    byCountry.set(point.pais, [...(byCountry.get(point.pais) ?? []), point]);
  }

  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1080px]">
        {t.imageUrl && (
          <div className="relative mb-8 h-48 overflow-hidden rounded-3xl bg-[#EAE6D8] sm:h-72">
            <Image src={t.imageUrl} alt={t.imageAlt} fill sizes="(min-width: 1080px) 1080px, 100vw" className="object-cover" />
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{t.eyebrow}</p>
        <h1 className="mt-3 max-w-[820px] font-serif text-[clamp(34px,5.5vw,58px)] font-medium leading-[1.05] tracking-[-.03em] text-[#16392D]">
          {t.title}
        </h1>
        <p className="mt-4 max-w-[720px] text-base leading-7 text-[#4E6256] sm:text-lg">{t.intro}</p>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-medium text-[#1D4032]">{t.listTitle}</h2>
          {points.length ? (
            [...byCountry.entries()].map(([country, countryPoints]) => (
              <div key={country} className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[.16em] text-[#96743B]">
                  {country} · {countryPoints.length}
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {countryPoints.map((point) => (
                    <article key={point.id} className="rounded-2xl border border-[#E2E7DE] bg-white p-5 text-sm">
                      <h4 className="font-serif text-lg font-medium text-[#1D4032]">{point.nome}</h4>
                      <p className="mt-1 text-[#5C6F63]">
                        {[point.municipio, point.estado].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-2 text-[#334B40]">{point.localizacao}</p>
                      <p className="mt-2 text-[#334B40]">{point.contatoAcolhimento}</p>
                      {point.siteOuInstagram && (
                        <a
                          href={point.siteOuInstagram}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="mt-2 inline-block break-all text-[#2A6249] underline"
                        >
                          {point.siteOuInstagram.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#CBD6CB] bg-white/70 px-6 py-8 text-center text-sm text-[#66756A]">
              {t.listEmpty}
            </p>
          )}
        </section>

        <section id="cadastro" className="mt-12 max-w-[820px]">
          <h2 className="font-serif text-2xl font-medium text-[#1D4032]">{t.formTitle}</h2>
          <p className="mb-4 mt-2 text-sm leading-6 text-[#5C6F63]">{t.formIntro}</p>
          <PontoForm locale={l} />
          {t.note && (
            <p className="mt-5 rounded-xl border border-[#E7DDBF] bg-[#FFF9E9] px-5 py-4 text-sm leading-6 text-[#685835]">
              {t.note}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
