import { buildAssistantReply } from "@/lib/assistant/engine";
import { getAdminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const eventType = body.eventType;

  if (eventType === "cta_click") {
    const interactionId = typeof body.interactionId === "string" ? body.interactionId : "";
    const intent = typeof body.intent === "string" ? body.intent : "geral";
    const ctaLabel = typeof body.ctaLabel === "string" ? body.ctaLabel : "";
    const ctaHref = typeof body.ctaHref === "string" ? body.ctaHref : "";

    if (!interactionId || !ctaLabel || !ctaHref) {
      return NextResponse.json({ error: "Dados de clique incompletos." }, { status: 400 });
    }

    const now = new Date().toISOString();
    try {
      await getAdminDb().collection("assistant_interactions").add({
        eventType: "cta_click",
        interactionId,
        intent,
        ctaLabel,
        ctaHref,
        createdAt: now,
        channel: "portal_publico",
      });
    } catch {
      // O clique nao pode bloquear navegacao do visitante.
    }

    return NextResponse.json({ ok: true, timestamp: now });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "Mensagem obrigatoria." }, { status: 400 });
  }

  const reply = buildAssistantReply(message);
  const now = new Date().toISOString();
  let interactionId: string | null = null;

  try {
    const ref = await getAdminDb().collection("assistant_interactions").add({
      eventType: "message",
      message,
      intent: reply.intent,
      understood: reply.intent !== "geral",
      replyHasCtas: reply.ctas.length > 0,
      ctasCount: reply.ctas.length,
      createdAt: now,
      channel: "portal_publico",
    });
    interactionId = ref.id;
  } catch {
    // Em caso de erro de persistencia, a resposta ao visitante ainda deve funcionar.
  }

  return NextResponse.json({ ok: true, reply, interactionId, timestamp: now });
}
