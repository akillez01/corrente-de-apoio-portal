import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.daimesolidariedade.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas internas e APIs não devem ser indexadas.
      disallow: [
        "/api/",
        "/login",
        "/conta",
        "/meus-pedidos",
        "/curadoria",
        "/servico-social",
        "/financeiro",
        "/voluntarios",
        "/admin",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
