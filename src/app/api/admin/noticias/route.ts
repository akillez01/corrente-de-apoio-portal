import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { appendAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { NEWS_COLLECTION } from "@/lib/data/news";
import { parseNewsInput } from "@/lib/domain/newsInput";
import { slugify } from "@/lib/domain/slugify";
import { getAdminDb } from "@/lib/firebase/admin";
import { locales } from "@/lib/i18n/config";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "editor_conteudo" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const input = parseNewsInput(await req.json().catch(() => null));
  if (!input) {
    return NextResponse.json({ error: "Preencha título, resumo, texto e data. Imagens precisam de descrição." }, { status: 400 });
  }

  const ref = getAdminDb().collection(NEWS_COLLECTION).doc();
  const ator = user.nome ?? user.email ?? user.uid;
  const now = new Date().toISOString();
  const slug = `${slugify(input.titulo).slice(0, 70)}-${ref.id.slice(0, 4).toLowerCase()}`;
  await ref.set({ ...input, slug, autor: ator, criadoEm: now, atualizadoEm: now });
  await appendAuditLog({ tipo: "noticia_criada", ator, alvo: ref.id, detalhes: { status: input.status } });
  for (const locale of locales) revalidatePath(`/${locale}/noticias`);
  return NextResponse.json({ ok: true, id: ref.id, slug });
}
