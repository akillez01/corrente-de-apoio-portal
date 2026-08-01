import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { uploadAttachment } from "@/lib/storage/attachments";
import { appendAuditLog } from "@/lib/audit";

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "requerente" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const formData = await req.formData();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const urgente = formData.get("urgente") === "true";
  const meta = Number(formData.get("meta"));
  const prazo = formData.get("prazo") ? String(formData.get("prazo")) : undefined;
  const descricao = String(formData.get("descricao") ?? "").trim();
  const consentimentoLgpd = formData.get("consentimentoLgpd") === "true";
  const anexos = formData.getAll("anexos").filter((f): f is File => isFile(f) && f.size > 0);

  if (!titulo || !categoria || !meta || meta <= 0 || !descricao) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
  }
  if (!consentimentoLgpd) {
    return NextResponse.json(
      { error: "É necessário consentir com o tratamento dos dados (LGPD) para enviar o pedido." },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  const requestRef = db.collection("requests").doc();
  const attachments = [];
  for (const file of anexos) {
    attachments.push(await uploadAttachment(requestRef.id, file));
  }

  const now = new Date().toISOString();
  await requestRef.set({
    requerenteId: user.uid,
    requerenteNome: user.nome ?? user.email ?? "Requerente",
    titulo,
    categoria,
    urgente,
    meta,
    prazo: prazo || null,
    descricao,
    textoPublico: "",
    anexos: attachments,
    consentimentoLgpdEm: now,
    status: "submetido",
    mensagens: [],
    criadoEm: now,
    atualizadoEm: now,
  });

  await appendAuditLog({
    tipo: "pedido_submetido",
    ator: user.nome ?? user.email ?? user.uid,
    alvo: requestRef.id,
  });

  return NextResponse.json({ ok: true, id: requestRef.id });
}
