import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { PROJECTS_COLLECTION } from "@/lib/data/network";
import { APOIOS_PROJETO, EMAIL_PATTERN, normalizeLink } from "@/lib/domain/rede";
import { slugify } from "@/lib/domain/slugify";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendSystemEmailNotification } from "@/lib/notifications/systemEmail";

function field(body: Record<string, unknown>, key: string, max: number) {
  const value = typeof body[key] === "string" ? (body[key] as string).trim() : "";
  return value.length > max ? null : value;
}

// Cadastro público de projeto. Fica pendente até a moderação aprovar.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Formulário inválido." }, { status: 400 });
  }
  // Campo-armadilha: invisível para pessoas, preenchido por robôs.
  if (field(body, "website", 200)) return NextResponse.json({ ok: true });

  const titulo = field(body, "titulo", 120);
  const resumo = field(body, "resumo", 280);
  const descricao = field(body, "descricao", 5_000);
  const local = field(body, "local", 160);
  const responsavelNome = field(body, "responsavelNome", 120);
  const responsavelEmail = field(body, "responsavelEmail", 160);
  const responsavelTelefone = field(body, "responsavelTelefone", 40);
  const linkBruto = field(body, "linkExterno", 300);
  const linkExterno = linkBruto ? normalizeLink(linkBruto) : null;
  const apoiosNecessarios = Array.isArray(body.apoiosNecessarios)
    ? [...new Set(body.apoiosNecessarios.filter((v): v is string => (APOIOS_PROJETO as readonly string[]).includes(v)))]
    : [];

  if (
    !titulo ||
    !resumo ||
    !descricao ||
    !local ||
    !responsavelNome ||
    !responsavelEmail ||
    !EMAIL_PATTERN.test(responsavelEmail) ||
    responsavelTelefone === null ||
    (linkBruto && !linkExterno) ||
    apoiosNecessarios.length === 0 ||
    body.consentimento !== true
  ) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
  }

  const ref = getAdminDb().collection(PROJECTS_COLLECTION).doc();
  const now = new Date().toISOString();
  await ref.set({
    slug: `${slugify(titulo).slice(0, 60)}-${ref.id.slice(0, 5).toLowerCase()}`,
    titulo,
    resumo,
    descricao,
    local,
    apoiosNecessarios,
    linkExterno,
    responsavelNome,
    responsavelEmail,
    responsavelTelefone: responsavelTelefone || null,
    status: "pendente",
    criadoEm: now,
    atualizadoEm: now,
  });
  await appendAuditLog({ tipo: "projeto_cadastrado", ator: responsavelEmail, alvo: ref.id });
  const notificationSent = await sendSystemEmailNotification({
    event: "novo projeto para moderação",
    recordId: ref.id,
    path: "/admin/moderacao",
  });
  return NextResponse.json({ ok: true, notificationSent });
}
