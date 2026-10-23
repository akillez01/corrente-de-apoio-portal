import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionUser } from "@/lib/auth/session";
import { requestAccess } from "@/lib/auth/requestAccess";
import { getRequestById } from "@/lib/data/requests";
import { getAdminDb } from "@/lib/firebase/admin";
import { appendAuditLog } from "@/lib/audit";
import { uploadAttachment } from "@/lib/storage/attachments";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/storage/limits";

const MAX_TOTAL_ATTACHMENTS = 15;

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

// Documentos enviados depois do cadastro (ex.: quando a equipe pede um comprovante).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const request = await getRequestById(id);
  if (!request) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  const origem = requestAccess(user, request);
  if (!user || !origem) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  if (request.status === "arquivado") return NextResponse.json({ error: "Este pedido foi cancelado." }, { status: 409 });

  const formData = await req.formData().catch(() => null);
  const files = (formData?.getAll("anexos") ?? []).filter((f): f is File => isFile(f) && f.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "Escolha pelo menos um arquivo." }, { status: 400 });
  if (request.anexos.length + files.length > MAX_TOTAL_ATTACHMENTS) {
    return NextResponse.json({ error: `O pedido pode ter no máximo ${MAX_TOTAL_ATTACHMENTS} anexos.` }, { status: 400 });
  }
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: `O total enviado de uma vez não pode passar de ${MAX_UPLOAD_LABEL}.` }, { status: 400 });
  }

  const saved = [];
  try {
    for (const file of files) saved.push(await uploadAttachment(id, file));
  } catch (error) {
    console.error("Falha ao salvar anexos do pedido", id, error);
    return NextResponse.json({ error: "Não foi possível enviar os arquivos agora. Tente novamente mais tarde." }, { status: 503 });
  }

  const now = new Date().toISOString();
  await getAdminDb()
    .collection("requests")
    .doc(id)
    .update({
      anexos: FieldValue.arrayUnion(...saved),
      mensagens: FieldValue.arrayUnion({
        autor: origem === "requerente" ? (request.identificacao?.nomeSocial || request.requerenteNome) : (user.nome ?? "Equipe"),
        texto: `Enviou ${saved.length} documento(s): ${saved.map((a) => a.nome).join(", ")}`,
        criadoEm: now,
        origem,
      }),
      atualizadoEm: now,
    });
  await appendAuditLog({ tipo: "anexo_adicionado", ator: user.nome ?? user.email ?? user.uid, alvo: id, detalhes: { quantidade: saved.length } });
  return NextResponse.json({ ok: true });
}
