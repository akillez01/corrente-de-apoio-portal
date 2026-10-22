"use client";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { PublicPageCopy } from "@/lib/types/siteContent";

export function SiteHeader({ locale, copy }: { locale: Locale; copy: PublicPageCopy }) {
  const nav = [
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isEnglish = locale === "en";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function closeOnPageScroll() {
      setMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("scroll", closeOnPageScroll, { passive: true, once: true });

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("scroll", closeOnPageScroll);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-white/10 bg-[#12372B] text-white shadow-[0_8px_24px_rgba(15,45,35,.12)]">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8">
        <Link href={`/${locale}`} className="flex min-w-0 shrink items-center gap-2 sm:gap-3" aria-label={isEnglish ? "Daime Solidariedade — home" : "Daime Solidariedade — início"}>
          <Image
            src="https://optim.tildacdn.one/tild3166-6538-4637-b234-343136396538/-/cover/212x212/center/center/-/format/webp/BLOCO_1_-_LOGOTIPO.png.webp"
            alt="Símbolo ICEFLU"
            width={40}
            height={40}
            className="h-8 w-8 shrink-0 rounded-full border border-white/25 bg-white object-cover sm:h-10 sm:w-10"
          />
          <span className="min-w-0 leading-tight">
            <strong className="block truncate font-serif text-[clamp(12px,3.6vw,14px)] font-semibold tracking-tight sm:text-lg">
              {copy.siteName}
            </strong>
            <small className="mt-0.5 hidden truncate text-[10px] text-white/70 sm:block sm:text-[11px]">
              {copy.siteTagline}
            </small>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <a
            href="https://www.instagram.com/p/DeZbjHtDoxY/?dlrf=YmQycWU5dDRuaWd2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={isEnglish ? "Visit us on Instagram" : "Acesse nosso Instagram"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1D58A] sm:h-10 sm:w-10"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <LanguageSwitcher locale={locale} />
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? (isEnglish ? "Close menu" : "Fechar menu") : (isEnglish ? "Open menu" : "Abrir menu")}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1D58A]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? (
                <path d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="site-navigation"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`grid border-t border-white/10 bg-[#12372B] transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setMenuOpen(false);
            menuButtonRef.current?.focus();
          }
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <nav
            aria-label={isEnglish ? "Main navigation" : "Navegação principal"}
            className="mx-auto grid max-w-[1320px] gap-1 px-5 py-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-5"
          >
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={`/${locale}/${href}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 sm:col-span-2 lg:col-span-5 lg:justify-self-start"
            >
              {isEnglish ? "Sign in" : "Entrar"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
