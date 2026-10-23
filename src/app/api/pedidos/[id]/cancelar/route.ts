import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionUser } from "@/lib/auth/session";
import { getRequestById } from "@/lib/data/requests";
import { getAdminDb } from "@/lib/firebase/admin";
import { appendAuditLog } from "@/lib/audit";

const CANCELAVEIS = ["submetido", "em_analise", "em_alinhamento"];

// A própria pessoa informa que não precisa mais de ajuda.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const request = await getRequestById(id);
  if (!request) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (!user || user.uid !== request.requerenteId) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  if (!CANCELAVEIS.includes(request.status)) {
    return NextResponse.json(
      { error: "Este pedido já seguiu para outra etapa. Escreva uma mensagem para a equipe." },
      { status: 409 },
    );
  }

  const body = await req.json().catch(() => null);
  const motivo = typeof body?.motivo === "string" ? body.motivo.trim().slice(0, 1000) : "";
  const now = new Date().toISOString();
  await getAdminDb()
    .collection("requests")
    .doc(id)
    .update({
      status: "arquivado",
      mensagens: FieldValue.arrayUnion({
        autor: request.identificacao?.nomeSocial || request.requerenteNome,
        texto: `Cancelou o pedido${motivo ? `: ${motivo}` : "."}`,
        criadoEm: now,
        origem: "requerente",
      }),
      atualizadoEm: now,
    });
  await appendAuditLog({ tipo: "pedido_cancelado_pelo_requerente", ator: user.email ?? user.uid, alvo: id });
  return NextResponse.json({ ok: true });
}
