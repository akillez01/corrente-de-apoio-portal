import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { savePublicPageCopy } from "@/lib/data/content";
import { locales, type Locale } from "@/lib/i18n/config";
import {
  isPublicPageCopy,
  isPublicPageId,
  type PublicPageId,
} from "@/lib/types/siteContent";

const ROUTES: Record<PublicPageId, string[]> = {
  global: ["/[locale]"],
  home: ["/[locale]"],
  about: ["/[locale]/o-que-e"],
  support: ["/[locale]/preciso-de-ajuda"],
  volunteering: ["/[locale]/voluntariar"],
  projects: ["/[locale]/projetar", "/[locale]/projetar/[slug]"],
  transparency: ["/[locale]/transparencia"],
  "how-it-works": ["/[locale]/como-funciona"],
  youth: ["/[locale]/juventude"],
  women: ["/[locale]/mulheres"],
  campaigns: ["/[locale]/doar"],
  "campaign-detail": ["/[locale]/campanha/[slug]"],
  integrate: ["/[locale]/integrar"],
  "women-support": ["/[locale]/mulheres/apoio"],
  news: ["/[locale]/noticias", "/[locale]/noticias/fazenda-sao-sebastiao-internet"],
};

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "editor_conteudo" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Corpo da solicitação inválido." }, { status: 400 });
  }

  const pageId = Reflect.get(body, "pageId");
  const locale = Reflect.get(body, "locale");
  const copy = Reflect.get(body, "copy");
  if (!isPublicPageId(pageId)) {
    return NextResponse.json({ error: "Página inválida." }, { status: 400 });
  }
  if (typeof locale !== "string" || !locales.includes(locale as Locale)) {
    return NextResponse.json({ error: "Idioma inválido." }, { status: 400 });
  }
  if (!isPublicPageCopy(copy, pageId, locale as Locale)) {
    return NextResponse.json({ error: "Há campos de conteúdo inválidos." }, { status: 400 });
  }

  await savePublicPageCopy(pageId, locale as Locale, copy, user.nome ?? user.email ?? user.uid);
  for (const route of ROUTES[pageId]) {
    for (const supportedLocale of locales) {
      if (pageId === "global") {
        revalidatePath(route, "layout");
      } else {
        revalidatePath(
          route.replace("[locale]", supportedLocale),
          route.includes("[slug]") ? "page" : undefined,
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
