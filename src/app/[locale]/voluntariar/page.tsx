import { VoluntarioForm } from "@/components/voluntarios/VoluntarioForm";
import type { Locale } from "@/lib/i18n/config";
import { getPublicPageCopy } from "@/lib/data/content";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export default async function VoluntariarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = await getPublicPageCopy("volunteering", l);
  const steps = [t.step1, t.step2, t.step3];

  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[860px]">
        {t.imageUrl && (
          <div className="relative mb-8 h-48 overflow-hidden rounded-3xl bg-[#EAE6D8] sm:h-64">
            <Image src={t.imageUrl} alt={t.imageAlt} fill sizes="(min-width: 860px) 860px, 100vw" className="object-cover" />
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{t.eyebrow}</p>
        <h1 className="mt-3 text-balance font-serif text-[clamp(34px,5.5vw,58px)] font-medium leading-[1.05] tracking-[-.03em] text-[#16392D]">
          {t.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4E6256] sm:text-lg">{t.subtitle}</p>

        <section className="mt-8 rounded-2xl border border-[#E2E7DE] bg-white p-5 sm:p-6">
          <h2 className="font-serif text-xl font-medium text-[#1D4032]">{t.howItWorksTitle}</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={index} className="text-sm leading-6 text-[#5C6F63]">
                <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF4EF] font-serif text-[#2B644B]">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section id="inscricao" className="mt-8">
          <VoluntarioForm locale={l} />
        </section>

        <p className="mt-8 text-center text-[13px] text-[#5C6F63]">
          <Link href="/login?next=%2Fvoluntarios" className="underline underline-offset-2 hover:text-[#16392D]">
            {t.teamLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
