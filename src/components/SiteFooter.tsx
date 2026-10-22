import type { Locale } from "@/lib/i18n/config";
import type { PublicPageCopy } from "@/lib/types/siteContent";
import Link from "next/link";
import { FooterAssistantTrigger } from "@/components/assistente/FooterAssistantTrigger";

export function SiteFooter({ locale, copy }: { locale: Locale; copy: PublicPageCopy }) {
  const links = [
    [copy.homeLink, ""],
    [copy.navAbout, "o-que-e"],
    [copy.navSupport, "preciso-de-ajuda"],
    [copy.navDonate, "doar"],
    [copy.navVolunteer, "voluntariar"],
    [copy.navProject, "projetar"],
    [copy.navIntegrate, "integrar"],
    [copy.navWomen, "mulheres"],
    [copy.navYouth, "juventude"],
    [copy.navNews, "noticias"],
    [copy.navTransparency, "transparencia"],
  ] as const;

  return (
    <footer id="site-footer" className="bg-[#102F25] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 border-b border-white/15 pb-8 md:grid-cols-[1fr_1.2fr_.8fr]">
          <div>
            <Link href={`/${locale}`} className="font-serif text-xl font-semibold">
              {copy.siteName}
            </Link>
            <p className="mt-2 max-w-[340px] text-sm leading-6 text-white/65">
              {copy.footerTagline}
            </p>
          </div>
          <nav aria-label="Navegação do rodapé" className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
            {links.map(([label, href]) => (
              <Link key={href} href={`/${locale}/${href}`} className="text-white/75 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="text-sm text-white/75">
            <p className="font-semibold text-white">{copy.contactLabel}</p>
            <FooterAssistantTrigger label={copy.assistantHelp} />
            <a className="mt-2 inline-block underline-offset-2 hover:underline" href="mailto:daimesolidariedade@gmail.com">
              daimesolidariedade@gmail.com
            </a>
            <a
              aria-label="Acesse nosso Instagram"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              href="https://www.instagram.com/p/DeZbjHtDoxY/?dlrf=YmQycWU5dDRuaWd2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
              <span>{copy.instagramLabel}</span>
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-5 text-[11px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {copy.siteName} · ICEFLU</span>
          <span>{copy.rightsLine}</span>
        </div>
      </div>
    </footer>
  );
}
