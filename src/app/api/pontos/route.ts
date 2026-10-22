import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { POINTS_COLLECTION } from "@/lib/data/network";
import { EMAIL_PATTERN, normalizeLink } from "@/lib/domain/rede";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendSystemEmailNotification } from "@/lib/notifications/systemEmail";

function field(body: Record<string, unknown>, key: string, max: number) {
  const value = typeof body[key] === "string" ? (body[key] as string).trim() : "";
  return value.length > max ? null : value;
}

// Cadastro público de ponto do Santo Daime. Fica pendente até a moderação aprovar.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Formulário inválido." }, { status: 400 });
  }
  if (field(body, "website", 200)) return NextResponse.json({ ok: true });

  const nome = field(body, "nome", 120);
  const localizacao = field(body, "localizacao", 200);
  const municipio = field(body, "municipio", 100);
  const estado = field(body, "estado", 60);
  const pais = field(body, "pais", 60);
  const contatoAcolhimento = field(body, "contatoAcolhimento", 200);
  const linkBruto = field(body, "siteOuInstagram", 300);
  const siteOuInstagram = linkBruto ? normalizeLink(linkBruto) : null;
  const cadastradoPorEmail = field(body, "cadastradoPorEmail", 160);

  if (
    !nome ||
    !localizacao ||
    !municipio ||
    estado === null ||
    !pais ||
    !contatoAcolhimento ||
    (linkBruto && !siteOuInstagram) ||
    !cadastradoPorEmail ||
    !EMAIL_PATTERN.test(cadastradoPorEmail) ||
    body.consentimento !== true
  ) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
  }

  const ref = getAdminDb().collection(POINTS_COLLECTION).doc();
  const now = new Date().toISOString();
  await ref.set({
    nome,
    localizacao,
    municipio,
    estado: estado || null,
    pais,
    contatoAcolhimento,
    siteOuInstagram,
    cadastradoPorEmail,
    status: "pendente",
    criadoEm: now,
    atualizadoEm: now,
  });
  await appendAuditLog({ tipo: "ponto_cadastrado", ator: cadastradoPorEmail, alvo: ref.id });
  const notificationSent = await sendSystemEmailNotification({
    event: "novo ponto para moderação",
    recordId: ref.id,
    path: "/admin/moderacao",
  });
  return NextResponse.json({ ok: true, notificationSent });
}
