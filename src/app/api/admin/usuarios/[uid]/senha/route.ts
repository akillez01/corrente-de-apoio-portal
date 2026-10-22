import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminAuth } from "@/lib/firebase/admin";
import { appendAuditLog } from "@/lib/audit";

// Gera uma nova senha temporária para o usuário e derruba as sessões ativas dele.
// A senha é devolvida uma única vez ao admin, que a repassa; o usuário pode trocá-la
// depois em "Minha conta".
export async function POST(_req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  if (uid === user.uid) {
    return NextResponse.json(
      { error: "Para alterar a própria senha, use Minha conta." },
      { status: 400 },
    );
  }

  const auth = getAdminAuth();
  const target = await auth.getUser(uid).catch(() => null);
  if (!target) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const senhaTemporaria = randomBytes(9).toString("base64url");
  try {
    await auth.updateUser(uid, { password: senhaTemporaria });
    await auth.revokeRefreshTokens(uid);
  } catch {
    return NextResponse.json({ error: "Não foi possível redefinir a senha." }, { status: 500 });
  }

  await appendAuditLog({
    tipo: "senha_redefinida",
    ator: user.nome ?? user.email ?? user.uid,
    alvo: uid,
    detalhes: { email: target.email ?? null },
  });

  return NextResponse.json({ ok: true, senhaTemporaria });
}
