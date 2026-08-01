import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { getRequestById } from "@/lib/data/requests";
import { appendAuditLog } from "@/lib/audit";
import { slugify } from "@/lib/domain/slugify";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "curador" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const request = await getRequestById(params.id);
  if (!request) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  const body = await req.json();
  const action = body.action;
  const textoPublico =
    typeof body.textoPublico === "string" ? body.textoPublico : request.textoPublico;
  const ator = user.nome ?? user.email ?? user.uid;
  const now = new Date().toISOString();
  const db = getAdminDb();
  const requestRef = db.collection("requests").doc(request.id);

  if (action === "reprovar") {
    await requestRef.update({
      status: "reprovado",
      textoPublico,
      atualizadoEm: now,
    });
    await appendAuditLog({ tipo: "pedido_reprovado", ator, alvo: request.id });
    return NextResponse.json({ ok: true });
  }

  if (action === "alinhar") {
    const mensagens = [...request.mensagens];
    if (typeof body.mensagem === "string" && body.mensagem.trim()) {
      mensagens.push({ autor: ator, texto: body.mensagem.trim(), criadoEm: now });
    }
    await requestRef.update({
      status: "em_alinhamento",
      textoPublico,
      mensagens,
      atualizadoEm: now,
    });
    await appendAuditLog({ tipo: "pedido_alinhamento", ator, alvo: request.id });
    return NextResponse.json({ ok: true });
  }

  if (action === "aprovar") {
    if (!textoPublico.trim()) {
      return NextResponse.json(
        { error: "Texto público é obrigatório para publicar." },
        { status: 400 },
      );
    }

    const campaignRef = db.collection("campaigns").doc();
    const paragrafos = textoPublico
      .split(/\n{2,}/)
      .map((p: string) => p.trim())
      .filter(Boolean);
    const slug = slugify(request.titulo);

    await db.runTransaction(async (tx) => {
      tx.update(requestRef, {
        status: "aprovado",
        textoPublico,
        curadorId: user.uid,
        atualizadoEm: now,
      });
      tx.set(campaignRef, {
        slug,
        titulo: request.titulo,
        categoria: request.categoria,
        urgente: request.urgente,
        resumoPublico: (paragrafos[0] ?? "").slice(0, 200),
        textoPublico: paragrafos,
        meta: request.meta,
        arrecadado: 0,
        moeda: "BRL",
        status: "publicado",
        doacoesCount: 0,
        prazo: request.prazo ?? null,
        verificadoEm: now,
        aprovadoPor: ator,
        aprovadoPorUid: user.uid,
        criadoEm: now,
        atualizadoEm: now,
        requestId: request.id,
      });
    });

    await appendAuditLog({
      tipo: "pedido_aprovado_publicado",
      ator,
      alvo: request.id,
      detalhes: { campaignId: campaignRef.id, slug },
    });

    return NextResponse.json({ ok: true, slug });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
