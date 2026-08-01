import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { saveFile } from "@/lib/storage/localStorage";
import { appendAuditLog } from "@/lib/audit";

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

export async function POST(req: Request, { params }: { params: { campaignId: string } }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "financeiro" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const db = getAdminDb();
  const campaignRef = db.collection("campaigns").doc(params.campaignId);
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

  const formData = await req.formData();
  const valor = Number(formData.get("valor"));
  const data = String(formData.get("data") ?? "");
  const comprovante = formData.get("comprovante");

  if (!valor || valor <= 0 || !data) {
    return NextResponse.json({ error: "Valor e data são obrigatórios." }, { status: 400 });
  }
  if (!isFile(comprovante) || comprovante.size === 0) {
    return NextResponse.json({ error: "Comprovante é obrigatório." }, { status: 400 });
  }

  const path = `transfers/${params.campaignId}/${Date.now()}-${comprovante.name}`;
  const buffer = Buffer.from(await comprovante.arrayBuffer());
  await saveFile(path, buffer);

  const now = new Date().toISOString();
  const transferRef = db.collection("transfers").doc();
  const ator = user.nome ?? user.email ?? user.uid;

  await db.runTransaction(async (tx) => {
    tx.set(transferRef, {
      campaignId: params.campaignId,
      valor,
      data,
      comprovanteUrl: path,
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
    alvo: params.campaignId,
    detalhes: { transferId: transferRef.id, valor },
  });

  return NextResponse.json({ ok: true });
}
