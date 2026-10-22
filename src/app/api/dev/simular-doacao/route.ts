import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import type { DonationMethod } from "@/lib/types/domain";

// Simula o webhook do PSP (Mercado Pago/PayPal) para fins de desenvolvimento local.
// Só roda contra o Firestore Emulator — nunca escreve em um projeto Firebase real.
export async function POST(req: Request) {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    return NextResponse.json(
      { error: "Simulação de doação disponível apenas com o Firestore Emulator." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const campaignId = typeof body.campaignId === "string" ? body.campaignId : null;
  const valor =
    typeof body.valor === "number" && Number.isFinite(body.valor) && body.valor > 0 && body.valor <= 1_000_000
      ? body.valor
      : null;
  const metodo: DonationMethod | null = body.metodo === "pix" || body.metodo === "paypal" ? body.metodo : null;
  const nome = typeof body.nome === "string" && body.nome.trim() ? body.nome.trim() : null;

  if (!campaignId || campaignId.length > 128 || !valor || !metodo) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const db = getAdminDb();
  const campaignRef = db.collection("campaigns").doc(campaignId);
  const donationRef = db.collection("donations").doc();
  const auditRef = db.collection("audit_log").doc();
  const now = new Date().toISOString();

  const result = await db.runTransaction(async (tx) => {
    const campaignSnap = await tx.get(campaignRef);
    if (!campaignSnap.exists) return null;

    tx.set(donationRef, {
      campaignId,
      valor,
      moeda: "BRL",
      metodo,
      anonimo: !nome,
      nome,
      externalId: donationRef.id,
      criadoEm: now,
    });
    tx.update(campaignRef, {
      arrecadado: FieldValue.increment(valor),
      doacoesCount: FieldValue.increment(1),
      atualizadoEm: now,
    });
    tx.set(auditRef, {
      tipo: "doacao_webhook_simulada",
      campaignId,
      valor,
      ator: "sistema (simulação dev)",
      timestamp: now,
    });

    return true;
  });

  if (!result) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
