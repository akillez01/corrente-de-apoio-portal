import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { appendAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { POINTS_COLLECTION, PROJECTS_COLLECTION } from "@/lib/data/network";
import { getAdminDb } from "@/lib/firebase/admin";
import { locales } from "@/lib/i18n/config";

const TARGETS = {
  projeto: { collection: PROJECTS_COLLECTION, page: "projetar" },
  ponto: { collection: POINTS_COLLECTION, page: "integrar" },
} as const;

// Aprova, reprova ou retira do ar projetos e pontos enviados pelo portal.
export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "editor_conteudo" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }
  const target = TARGETS[body.tipo as keyof typeof TARGETS];
  const status = { aprovar: "aprovado", reprovar: "reprovado", retirar: "pendente" }[String(body.action)];
  if (!target || !status || typeof body.id !== "string" || !body.id) {
    return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
  }

  const ref = getAdminDb().collection(target.collection).doc(body.id);
  const snapshot = await ref.get();
  if (!snapshot.exists) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });

  const ator = user.nome ?? user.email ?? user.uid;
  const now = new Date().toISOString();
  await ref.update({
    status,
    moderadoPor: ator,
    moderadoEm: now,
    atualizadoEm: now,
    ...(status === "aprovado" && !snapshot.get("publicadoEm") ? { publicadoEm: now } : {}),
  });
  await appendAuditLog({ tipo: `${body.tipo}_${status}`, ator, alvo: body.id });

  for (const locale of locales) {
    revalidatePath(`/${locale}/${target.page}`);
    if (body.tipo === "projeto") revalidatePath(`/${locale}/projetar/${snapshot.get("slug")}`);
  }
  return NextResponse.json({ ok: true });
}
