import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { appendAuditLog } from "@/lib/audit";
import type { Role } from "@/lib/types/domain";
import { sendSystemEmailNotification } from "@/lib/notifications/systemEmail";

const VALID_ROLES: Role[] = ["requerente", "curador", "assistente_social", "financeiro", "editor_conteudo", "admin"];

// Cria uma conta já com papel definido — papéis operacionais não são autoatribuíveis.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { nome, email, role } = await req.json();
  if (typeof nome !== "string" || !nome.trim()) {
    return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
  }
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  }

  const auth = getAdminAuth();
  const senhaTemporaria = randomBytes(9).toString("base64url");

  let userRecord;
  try {
    userRecord = await auth.createUser({ email, password: senhaTemporaria, displayName: nome });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
    }
    return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 400 });
  }

  await auth.setCustomUserClaims(userRecord.uid, { role, name: nome });
  await getAdminDb().collection("users").doc(userRecord.uid).set({
    nome,
    email,
    role,
    idioma: "pt",
  });

  await appendAuditLog({
    tipo: "usuario_criado",
    ator: user.nome ?? user.email ?? user.uid,
    alvo: userRecord.uid,
    detalhes: { email, papel: role },
  });

  const notificationSent = await sendSystemEmailNotification({
    event: "nova conta criada pela administração",
    recordId: userRecord.uid,
    path: "/admin/usuarios",
  });

  return NextResponse.json({ ok: true, uid: userRecord.uid, senhaTemporaria, notificationSent });
}
