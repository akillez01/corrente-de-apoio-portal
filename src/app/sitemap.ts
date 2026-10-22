import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getPublicCampaigns } from "@/lib/data/campaigns";
import { getProjectsByStatus } from "@/lib/data/network";
import { getPublishedNews } from "@/lib/data/news";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.daimesolidariedade.org";

export const revalidate = 3600;

const PAGES = [
  "",
  "o-que-e",
  "preciso-de-ajuda",
  "doar",
  "voluntariar",
  "projetar",
  "integrar",
  "mulheres",
  "mulheres/apoio",
  "juventude",
  "noticias",
  "noticias/fazenda-sao-sebastiao-internet",
  "transparencia",
  "como-funciona",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [campaigns, projects, news] = await Promise.all([
    getPublicCampaigns(),
    getProjectsByStatus("aprovado"),
    getPublishedNews(),
  ]);
  const paths = [
    ...PAGES,
    ...campaigns.map((campaign) => `campanha/${campaign.slug}`),
    ...projects.map((project) => `projetar/${project.slug}`),
    ...news.map((article) => `noticias/${article.slug}`),
  ];
  return locales.flatMap((locale) =>
    paths.map((path) => ({ url: `${SITE_URL}/${locale}${path ? `/${path}` : ""}` })),
  );
}
