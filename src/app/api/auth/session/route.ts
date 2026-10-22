import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { sendSystemEmailNotification } from "@/lib/notifications/systemEmail";

// Guarda o ID Token do Firebase em um cookie httpOnly. Em produção isso deveria
// evoluir para um cookie de sessão com refresh; para o MVP local o ID token
// (validade ~1h) já cobre o ciclo de uso de uma sessão de curadoria/financeiro.
//
// Primeiro login de uma conta (ex: cadastro via Google) provisiona automaticamente
// o papel "requerente" — o único papel auto-atribuível. Curador/financeiro/admin só
// são concedidos manualmente pela tela /admin/usuarios (ver src/app/api/admin/usuarios/[uid]).
export async function POST(req: Request) {
  const { idToken } = await req.json();
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "idToken ausente." }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  let provisioned = false;
  if (!decoded.role) {
    const userDoc = getAdminDb().collection("users").doc(decoded.uid);
    const snapshot = await userDoc.get();
    if (!snapshot.exists) {
      const nome = (decoded.name as string | undefined) ?? decoded.email ?? "Usuário";
      await getAdminAuth().setCustomUserClaims(decoded.uid, { role: "requerente", name: nome });
      await userDoc.set({ nome, email: decoded.email ?? "", role: "requerente", idioma: "pt" });
      provisioned = true;
    }
  }

  const notificationSent = provisioned
    ? await sendSystemEmailNotification({
        event: "nova conta",
        recordId: decoded.uid,
        path: "/admin/usuarios",
      })
    : null;

  const res = NextResponse.json({ ok: true, provisioned, notificationSent });
  res.cookies.set(SESSION_COOKIE, idToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 3600,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
