import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPageCopy } from "@/lib/data/content";
import { getApprovedProjectBySlug } from "@/lib/data/network";
import { APOIO_LABELS_EN } from "@/lib/domain/rede";
import { ShareLinkButton } from "@/components/rede/ShareLinkButton";

export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getApprovedProjectBySlug(slug);
  return project ? { title: project.titulo, description: project.resumo } : {};
}

export default async function ProjetoPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const l = locale as Locale;
  const [t, project] = await Promise.all([getPublicPageCopy("projects", l), getApprovedProjectBySlug(slug)]);
  if (!project) notFound();
  const mailSubject = encodeURIComponent(`Apoio ao projeto: ${project.titulo}`);

  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <article className="mx-auto max-w-[820px]">
        <Link href={`/${l}/projetar`} className="text-[13px] text-[#5C6F63] hover:text-[#16392D]">
          ← {t.backToList}
        </Link>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{project.local}</p>
        <h1 className="mt-3 font-serif text-[clamp(32px,5vw,54px)] font-medium leading-[1.05] tracking-[-.03em] text-[#16392D]">
          {project.titulo}
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#4E6256]">{project.resumo}</p>

        <div className="mt-8 space-y-4 text-[15px] leading-7 text-[#334B40]">
          {project.descricao.split(/\n{2,}/).map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">{paragraph}</p>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-[#E2E7DE] bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5C6F63]">{t.supportNeeded}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.apoiosNecessarios.map((apoio) => (
              <span key={apoio} className="rounded-full bg-[#EFF4EF] px-3 py-1 text-sm text-[#2A6249]">
                {l === "en" ? APOIO_LABELS_EN[apoio] ?? apoio : apoio}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-[#5C6F63]">{project.responsavelNome}</p>
          {project.linkExterno && (
            <a href={project.linkExterno} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-block text-sm text-[#2A6249] underline">
              {project.linkExterno.replace(/^https?:\/\//, "")}
            </a>
          )}
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:daimesolidariedade@gmail.com?subject=${mailSubject}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#BD8127] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9E6920]"
          >
            {t.supportCta}
          </a>
          <ShareLinkButton path={`/${l}/projetar/${project.slug}`} label={t.shareLabel} copiedLabel={t.copiedLabel} />
        </div>
      </article>
    </main>
  );
}
