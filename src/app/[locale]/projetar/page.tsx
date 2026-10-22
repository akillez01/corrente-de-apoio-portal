import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";
import { getPublicPageCopy } from "@/lib/data/content";
import { getProjectsByStatus } from "@/lib/data/network";
import { ProjetoForm } from "@/components/rede/ProjetoForm";
import { APOIO_LABELS_EN } from "@/lib/domain/rede";

export const revalidate = 60;

export default async function ProjetarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const [t, projects] = await Promise.all([getPublicPageCopy("projects", l), getProjectsByStatus("aprovado")]);

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
          <h2 className="font-serif text-2xl font-medium text-[#1D4032]">{t.waitingTitle}</h2>
          {projects.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/${l}/projetar/${project.slug}`}
                  className="group flex flex-col rounded-2xl border border-[#E2E7DE] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#2A6249]/40 hover:shadow-[0_12px_30px_rgba(24,54,41,.08)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#96743B]">{project.local}</p>
                  <h3 className="mt-2 font-serif text-xl font-medium text-[#1D4032]">{project.titulo}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#5C6F63]">{project.resumo}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.apoiosNecessarios.map((apoio) => (
                      <span key={apoio} className="rounded-full bg-[#EFF4EF] px-2.5 py-0.5 text-[11.5px] text-[#2A6249]">
                        {l === "en" ? APOIO_LABELS_EN[apoio] ?? apoio : apoio}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#CBD6CB] bg-white/70 px-6 py-8 text-center text-sm text-[#66756A]">
              {t.waitingEmpty}
            </p>
          )}
        </section>

        <section id="cadastro" className="mt-12 max-w-[820px]">
          <h2 className="font-serif text-2xl font-medium text-[#1D4032]">{t.formTitle}</h2>
          <p className="mb-4 mt-2 text-sm leading-6 text-[#5C6F63]">{t.formIntro}</p>
          <ProjetoForm locale={l} />
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
