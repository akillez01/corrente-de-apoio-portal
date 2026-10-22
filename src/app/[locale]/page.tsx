import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";
import { getPublicPageCopy } from "@/lib/data/content";
import { getPageCopyDefaults } from "@/lib/types/siteContent";

export const revalidate = 60;

const PATHS = [
  {
    href: "preciso-de-ajuda",
    icon: <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />,
  },
  {
    href: "doar",
    icon: (
      <>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13M5 12v9h14v-9M12 8S10.5 3 8 4.5 9 8 12 8Zm0 0s1.5-5 4-3.5S15 8 12 8Z" />
      </>
    ),
  },
  {
    href: "voluntariar",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 4.5a3 3 0 0 1 0 6M18 14.5a6 6 0 0 1 3 5.5" />
      </>
    ),
  },
  {
    href: "projetar",
    icon: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" />,
  },
  {
    href: "integrar",
    icon: (
      <>
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </>
    ),
  },
] as const;

export default async function PortalPublicoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = await getPublicPageCopy("home", l);
  const heroImageUrl = t.imageUrl || getPageCopyDefaults("home", l).imageUrl;
  const heroImageAlt = t.imageAlt || getPageCopyDefaults("home", l).imageAlt;
  const paths = PATHS.map((path, index) => ({
    ...path,
    title: t[`path${index + 1}Title`],
    text: t[`path${index + 1}Text`],
  }));

  return (
    <main className="bg-[#F8F7F1] text-[#193B2F]">
      <section className={heroImageUrl ? "grid lg:min-h-[calc(100vh-120px)] lg:grid-cols-2" : "bg-[linear-gradient(135deg,#F8F7F1_0%,#E7EDE4_100%)]"}>
          {heroImageUrl && (
            <div className="relative min-h-[38vh] overflow-hidden bg-[#EAE6D8] sm:min-h-[48vh] lg:min-h-full">
              <Image
                src={heroImageUrl}
                alt={heroImageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[center_35%]"
              />
            </div>
          )}
          <div className={`flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-16 xl:px-20 ${heroImageUrl ? "" : "mx-auto w-full max-w-[1000px]"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#A17D3B]">
              {t.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[600px] text-balance font-serif text-[clamp(40px,5vw,68px)] font-medium leading-[1.05] tracking-[-.035em]">
              {t.title}
            </h1>
            <div className="mt-7 max-w-[680px] space-y-5 border-l-2 border-[#D8C79F] pl-5 sm:pl-7">
              <p className="text-base leading-8 text-[#56695D] sm:text-lg sm:leading-9">
                {t.intro1}
              </p>
              <details className="group md:hidden">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#2A6249]/30 px-5 py-2.5 text-sm font-semibold text-[#2A6249] transition hover:bg-[#EFF4EF] [&::-webkit-details-marker]:hidden">
                  <span>{t.readMore}</span>
                  <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="mt-5 space-y-5">
                  {[t.intro2, t.intro3].map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-8 text-[#56695D]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </details>
              <div className="hidden space-y-5 md:block">
                {[t.intro2, t.intro3].map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-[#56695D] sm:text-lg sm:leading-9"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
      </section>
      <section className="bg-white/60 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#A17D3B]">
              {t.pathsEyebrow}
            </p>
            <h2 className="mt-4 text-balance font-serif text-[clamp(32px,4vw,52px)] font-medium leading-tight tracking-[-.03em]">
              {t.pathsTitle}
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {paths.map((path) => (
              <Link
                key={path.href}
                href={`/${l}/${path.href}`}
                className="group flex flex-col rounded-2xl border border-[#E5E5D8] bg-[#F8F7F1] p-6 transition hover:-translate-y-1 hover:border-[#2A6249]/40 hover:shadow-[0_14px_30px_rgba(27,58,45,0.12)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2EEE5] text-[#2A6249] transition group-hover:bg-[#2A6249] group-hover:text-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {path.icon}
                  </svg>
                </span>
                <h3 className="mt-5 font-serif text-xl font-medium leading-snug text-[#193B2F]">
                  {path.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[#56695D]">{path.text}</p>
                <span aria-hidden="true" className="mt-4 text-sm font-semibold text-[#2A6249] transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href={`/${l}/o-que-e`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2A6249]/40 px-6 py-3.5 text-sm font-semibold text-[#2A6249] transition hover:bg-[#EFF4EF]"
            >
              {t.aboutLinkLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto flex max-w-[1180px] justify-center px-5 py-8 text-center sm:px-8 sm:py-10">
          <p className="max-w-[800px] font-serif text-xl font-medium leading-8 text-[#2A6249] sm:text-2xl">
            {t.closing}
          </p>
      </section>
    </main>
  );
}
