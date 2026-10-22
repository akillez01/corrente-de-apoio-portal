import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/storage/limits";
import { saveFile } from "@/lib/storage/localStorage";
import { appendAuditLog } from "@/lib/audit";

const MAX_RECEIPT_SIZE = MAX_UPLOAD_BYTES;

function safeFileName(name: string) {
  const sanitized = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized.slice(0, 120) || "comprovante";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

export async function POST(req: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const user = await getSessionUser();
  if (!user || (user.role !== "financeiro" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const db = getAdminDb();
  const campaignRef = db.collection("campaigns").doc(campaignId);
  const campaignSnap = await campaignRef.get();
  if (!campaignSnap.exists) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }
  const campaign = campaignSnap.data()!;

  if (campaign.aprovadoPorUid && campaign.aprovadoPorUid === user.uid) {
    return NextResponse.json(
      { error: "Segregação de função: quem aprovou a campanha não pode confirmar o repasse." },
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulário inválido." }, { status: 400 });
  }
  const valor = Number(formData.get("valor"));
  const data = String(formData.get("data") ?? "");
  const comprovante = formData.get("comprovante");

  if (!Number.isFinite(valor) || valor <= 0 || !data || Number.isNaN(Date.parse(data))) {
    return NextResponse.json({ error: "Valor e data são obrigatórios." }, { status: 400 });
  }
  if (!isFile(comprovante) || comprovante.size === 0) {
    return NextResponse.json({ error: "Comprovante é obrigatório." }, { status: 400 });
  }
  if (comprovante.size > MAX_RECEIPT_SIZE) {
    return NextResponse.json({ error: `O comprovante excede o limite de ${MAX_UPLOAD_LABEL}.` }, { status: 400 });
  }

  const path = `transfers/${campaignId}/${Date.now()}-${safeFileName(comprovante.name)}`;
  const buffer = Buffer.from(await comprovante.arrayBuffer());
  await saveFile(path, buffer);

  const now = new Date().toISOString();
  const transferRef = db.collection("transfers").doc();
  const ator = user.nome ?? user.email ?? user.uid;

  await db.runTransaction(async (tx) => {
    tx.set(transferRef, {
      campaignId,
      valor,
      data,
      comprovanteUrl: path,
      comprovanteNome: comprovante.name.slice(0, 120),
      confirmadoPor: ator,
    });
    tx.update(campaignRef, {
      status: "prestacao_publicada",
      atualizadoEm: now,
    });
  });

  await appendAuditLog({
    tipo: "repasse_confirmado",
    ator,
    alvo: campaignId,
    detalhes: { transferId: transferRef.id, valor },
  });

  return NextResponse.json({ ok: true });
}
