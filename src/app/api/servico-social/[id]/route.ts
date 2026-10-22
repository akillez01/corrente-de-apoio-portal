import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { getRequestById } from "@/lib/data/requests";
import { SOCIAL_CASES_COLLECTION } from "@/lib/data/socialCases";
import { appendAuditLog } from "@/lib/audit";
import type { SocialCase, SocialCaseEntry } from "@/lib/types/domain";

const TEXT_FIELDS = [
  "demandaApresentada",
  "sinteseSituacao",
  "avaliacaoSocial",
  "orientacaoRealizada",
  "encaminhamentos",
  "planoIntervencao",
  "acompanhamento",
] as const;

const MAX_TEXT = 10_000;

// Prontuário do Serviço Social. O conteúdo é sigiloso: o audit log registra só
// quem alterou e quando, nunca o texto.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user || (user.role !== "assistente_social" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const request = await getRequestById(id);
  if (!request) return NextResponse.json({ error: "Cadastro não encontrado." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }

  const ator = user.nome ?? user.email ?? user.uid;
  const now = new Date().toISOString();
  const caseRef = getAdminDb().collection(SOCIAL_CASES_COLLECTION).doc(id);
  const action = body.action;

  try {
    await getAdminDb().runTransaction(async (tx) => {
      const snapshot = await tx.get(caseRef);
      const current = snapshot.exists ? (snapshot.data() as Omit<SocialCase, "id">) : null;
      const requestRef = getAdminDb().collection("requests").doc(id);
      const requestSnapshot = action === "encaminhar_campanha" ? await tx.get(requestRef) : null;

      if (action === "salvar") {
        const updates: Partial<SocialCase> = {};
        for (const field of TEXT_FIELDS) {
          const value = body[field];
          if (typeof value !== "string" || value.length > MAX_TEXT) throw new RangeError(field);
          updates[field] = value.trim();
        }
        const dataAtendimento = body.dataAtendimento;
        if (typeof dataAtendimento !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dataAtendimento)) {
          throw new RangeError("dataAtendimento");
        }
        updates.dataAtendimento = dataAtendimento;
        if (current) {
          tx.update(caseRef, { ...updates, atualizadoEm: now });
        } else {
          tx.set(caseRef, {
            requestId: id,
            status: "aberto",
            profissionalResponsavel: ator,
            profissionalResponsavelUid: user.uid,
            evolucoes: [],
            encerramento: null,
            criadoEm: now,
            ...updates,
            atualizadoEm: now,
          });
        }
        return;
      }

      if (!current) throw new Error("CASE_NOT_FOUND");

      if (action === "assumir") {
        tx.update(caseRef, {
          profissionalResponsavel: ator,
          profissionalResponsavelUid: user.uid,
          atualizadoEm: now,
        });
        return;
      }

      const texto = typeof body.texto === "string" ? body.texto.trim() : "";
      const entry: SocialCaseEntry = { data: now, texto, autor: ator, autorUid: user.uid };

      if (action === "evolucao") {
        if (!texto || texto.length > MAX_TEXT) throw new RangeError("texto");
        if (current.status === "encerrado") throw new Error("CASE_CLOSED");
        tx.update(caseRef, { evolucoes: [...current.evolucoes, entry], atualizadoEm: now });
        return;
      }
      if (action === "encerrar") {
        if (!texto || texto.length > MAX_TEXT) throw new RangeError("texto");
        tx.update(caseRef, { status: "encerrado", encerramento: entry, atualizadoEm: now });
        return;
      }
      if (action === "encaminhar_campanha") {
        if (!texto || texto.length > MAX_TEXT) throw new RangeError("texto");
        if (current.status === "encerrado") throw new Error("CASE_CLOSED");
        const requestData = requestSnapshot?.data();
        if (requestData?.encaminhamentoCampanha) throw new Error("ALREADY_REFERRED");
        if (!["submetido", "em_analise", "em_alinhamento"].includes(String(requestData?.status))) {
          throw new Error("REQUEST_NOT_OPEN");
        }
        tx.update(requestRef, {
          status: "em_analise",
          encaminhamentoCampanha: { por: ator, porUid: user.uid, em: now, justificativa: texto },
          atualizadoEm: now,
        });
        tx.update(caseRef, {
          evolucoes: [
            ...current.evolucoes,
            { ...entry, texto: `Encaminhado à curadoria para avaliação de campanha: ${texto}` },
          ],
          atualizadoEm: now,
        });
        return;
      }
      if (action === "reabrir") {
        const reabertura: SocialCaseEntry = { ...entry, texto: "Atendimento reaberto." };
        tx.update(caseRef, {
          status: "aberto",
          encerramento: null,
          evolucoes: [...current.evolucoes, reabertura],
          atualizadoEm: now,
        });
        return;
      }
      throw new Error("INVALID_ACTION");
    });
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: "Há campos inválidos ou longos demais." }, { status: 400 });
    }
    if (error instanceof Error) {
      const messages: Record<string, [string, number]> = {
        CASE_NOT_FOUND: ["Salve a ficha de atendimento antes desta ação.", 409],
        CASE_CLOSED: ["Atendimento encerrado. Reabra para registrar evolução.", 409],
        INVALID_ACTION: ["Ação inválida.", 400],
        ALREADY_REFERRED: ["Este caso já foi encaminhado para campanha.", 409],
        REQUEST_NOT_OPEN: ["O pedido já foi concluído pela curadoria e não pode ser encaminhado.", 409],
      };
      const known = messages[error.message];
      if (known) return NextResponse.json({ error: known[0] }, { status: known[1] });
    }
    throw error;
  }

  await appendAuditLog({ tipo: `servico_social_${String(action)}`, ator, alvo: id });
  return NextResponse.json({ ok: true });
}
