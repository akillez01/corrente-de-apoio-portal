import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { appendAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { getNewsById, NEWS_COLLECTION } from "@/lib/data/news";
import { parseNewsInput } from "@/lib/domain/newsInput";
import { getAdminDb } from "@/lib/firebase/admin";
import { locales } from "@/lib/i18n/config";

async function authorize() {
  const user = await getSessionUser();
  return user && (user.role === "editor_conteudo" || user.role === "admin") ? user : null;
}

function revalidateNews(slug: string) {
  for (const locale of locales) {
    revalidatePath(`/${locale}/noticias`);
    revalidatePath(`/${locale}/noticias/${slug}`);
  }
}

// O slug fica fixo depois de criado, para não quebrar links já divulgados.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const current = await getNewsById(id);
  if (!current) return NextResponse.json({ error: "Notícia não encontrada." }, { status: 404 });
  const input = parseNewsInput(await req.json().catch(() => null));
  if (!input) {
    return NextResponse.json({ error: "Preencha título, resumo, texto e data. Imagens precisam de descrição." }, { status: 400 });
  }

  const ator = user.nome ?? user.email ?? user.uid;
  await getAdminDb().collection(NEWS_COLLECTION).doc(id).update({ ...input, atualizadoEm: new Date().toISOString() });
  await appendAuditLog({ tipo: "noticia_atualizada", ator, alvo: id, detalhes: { status: input.status } });
  revalidateNews(current.slug);
  return NextResponse.json({ ok: true, slug: current.slug });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const current = await getNewsById(id);
  if (!current) return NextResponse.json({ error: "Notícia não encontrada." }, { status: 404 });

  await getAdminDb().collection(NEWS_COLLECTION).doc(id).delete();
  await appendAuditLog({ tipo: "noticia_excluida", ator: user.nome ?? user.email ?? user.uid, alvo: id, detalhes: { titulo: current.titulo } });
  revalidateNews(current.slug);
  return NextResponse.json({ ok: true });
}
