import { PublicPage } from "@/components/public/PublicPage";
import type { Locale } from "@/lib/i18n/config";
import { getPublicPageCopy } from "@/lib/data/content";

export default async function ComoFuncionaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const copy = await getPublicPageCopy("how-it-works", l);

  return (
    <PublicPage
      locale={l}
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro}
      cta={{ label: copy.ctaLabel, href: "/" }}
      cards={[1, 2, 3, 4, 5, 6].map((number) => ({
        title: copy[`card${number}Title`],
        text: copy[`card${number}Text`],
      }))}
      note={copy.note}
      imageUrl={copy.imageUrl}
      imageAlt={copy.imageAlt}
    />
  );
}
