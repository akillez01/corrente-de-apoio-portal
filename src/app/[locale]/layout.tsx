import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AssistenteVirtualWidget } from "@/components/assistente/AssistenteVirtualWidget";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { locales, type Locale } from "@/lib/i18n/config";
import { getPublicPageCopy } from "@/lib/data/content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const revalidate = 60;

const METADATA_BY_LOCALE: Record<Locale, Metadata> = {
  pt: {
    title: {
      default: "Daime Solidariedade | Rede de cuidado e colaboração",
      template: "%s | Daime Solidariedade",
    },
    description:
      "Uma rede para conectar pessoas, capacidades, recursos, projetos e oportunidades em solidariedade com as comunidades.",
    alternates: { canonical: "/pt" },
  },
  en: {
    title: {
      default: "Daime Solidariedade | A network of care and collaboration",
      template: "%s | Daime Solidariedade",
    },
    description:
      "A network connecting people, skills, resources, projects, and opportunities in solidarity with communities.",
    alternates: { canonical: "/en" },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return METADATA_BY_LOCALE[locale as Locale] ?? METADATA_BY_LOCALE.pt;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  const copy = await getPublicPageCopy("global", locale as Locale);

  return (
    <div className="flex min-h-screen flex-col">
      <MotionProvider />
      <SiteHeader locale={locale as Locale} copy={copy} />
      <div className="flex-1">{children}</div>
      <SiteFooter locale={locale as Locale} copy={copy} />
      <AssistenteVirtualWidget />
    </div>
  );
}
