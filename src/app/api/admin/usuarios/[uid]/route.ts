import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { appendAuditLog } from "@/lib/audit";
import type { Role } from "@/lib/types/domain";

const VALID_ROLES: Role[] = ["requerente", "curador", "financeiro", "admin"];

export async function PATCH(req: Request, { params }: { params: { uid: string } }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { role } = await req.json();
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  }

  const targetAuthUser = await getAdminAuth().getUser(params.uid);
  await getAdminAuth().setCustomUserClaims(params.uid, {
    role,
    name: targetAuthUser.displayName ?? null,
  });
  await getAdminDb().collection("users").doc(params.uid).update({ role });

  await appendAuditLog({
    tipo: "papel_alterado",
    ator: user.nome ?? user.email ?? user.uid,
    alvo: params.uid,
    detalhes: { novoPapel: role },
  });

  return NextResponse.json({ ok: true });
}
