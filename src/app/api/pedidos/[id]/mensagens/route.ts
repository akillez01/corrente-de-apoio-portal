import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionUser } from "@/lib/auth/session";
import { requestAccess } from "@/lib/auth/requestAccess";
import { getRequestById } from "@/lib/data/requests";
import { getAdminDb } from "@/lib/firebase/admin";
import { appendAuditLog } from "@/lib/audit";
import { sendSystemEmailNotification } from "@/lib/notifications/systemEmail";

// Conversa entre a pessoa atendida e a equipe, dentro do pedido.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const request = await getRequestById(id);
  if (!request) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  const origem = requestAccess(user, request);
  if (!user || !origem) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  if (!texto || texto.length > 3000) {
    return NextResponse.json({ error: "Escreva a mensagem (até 3.000 caracteres)." }, { status: 400 });
  }
  if (origem === "requerente" && request.status === "arquivado") {
    return NextResponse.json({ error: "Este pedido foi cancelado." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const autor = origem === "requerente" ? (request.identificacao?.nomeSocial || request.requerenteNome) : (user.nome ?? user.email ?? "Equipe");
  await getAdminDb()
    .collection("requests")
    .doc(id)
    .update({
      mensagens: FieldValue.arrayUnion({ autor, texto, criadoEm: now, origem }),
      atualizadoEm: now,
    });
  await appendAuditLog({ tipo: `mensagem_${origem}`, ator: user.nome ?? user.email ?? user.uid, alvo: id });
  if (origem === "requerente") {
    await sendSystemEmailNotification({ event: "nova mensagem de quem pediu ajuda", recordId: id, path: `/servico-social/${id}` });
  }
  return NextResponse.json({ ok: true });
}
