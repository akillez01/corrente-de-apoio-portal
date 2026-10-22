import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { appendAuditLog } from "@/lib/audit";
import type { Role } from "@/lib/types/domain";

const VALID_ROLES: Role[] = ["requerente", "curador", "assistente_social", "financeiro", "editor_conteudo", "admin"];

export async function PATCH(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { role } = await req.json();
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  }

  const targetAuthUser = await getAdminAuth().getUser(uid);
  await getAdminAuth().setCustomUserClaims(uid, {
    role,
    name: targetAuthUser.displayName ?? null,
  });
  await getAdminDb().collection("users").doc(uid).update({ role });

  await appendAuditLog({
    tipo: "papel_alterado",
    ator: user.nome ?? user.email ?? user.uid,
    alvo: uid,
    detalhes: { novoPapel: role },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  if (uid === user.uid) {
    return NextResponse.json({ error: "Você não pode excluir a própria conta." }, { status: 400 });
  }

  const targetAuthUser = await getAdminAuth().getUser(uid).catch(() => null);
  await getAdminAuth()
    .deleteUser(uid)
    .catch(() => null);
  await getAdminDb().collection("users").doc(uid).delete();

  await appendAuditLog({
    tipo: "usuario_excluido",
    ator: user.nome ?? user.email ?? user.uid,
    alvo: uid,
    detalhes: { email: targetAuthUser?.email ?? null },
  });

  return NextResponse.json({ ok: true });
}
