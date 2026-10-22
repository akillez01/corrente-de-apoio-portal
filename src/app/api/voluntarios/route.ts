import { appendAuditLog } from "@/lib/audit";
import { getAdminDb } from "@/lib/firebase/admin";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/storage/limits";
import { saveFile } from "@/lib/storage/localStorage";
import { sendSystemEmailNotification } from "@/lib/notifications/systemEmail";
import { NextResponse } from "next/server";
import { FORMAS_CONTATO } from "@/lib/domain/acolhimento";
import { AREAS_ATUACAO, MODALIDADES, OFERTAS } from "@/lib/domain/voluntariado";

const MAX_FILE_SIZE = MAX_UPLOAD_BYTES;
const VOLUNTEER_AREAS = new Set<string>(AREAS_ATUACAO);
const OFFERS = new Set<string>(OFERTAS);

function textField(formData: FormData, key: string, max = 1_500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function pickAllowed(formData: FormData, key: string, allowed: Set<string>) {
  return [
    ...new Set(
      formData
        .getAll(key)
        .filter((value): value is string => typeof value === "string" && allowed.has(value)),
    ),
  ];
}

function isChecked(formData: FormData, key: string) {
  return formData.get(key) === "sim";
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "documento";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulário inválido." }, { status: 400 });
  }

  const email = textField(formData, "email", 160);
  const nomeCompleto = textField(formData, "nomeCompleto", 120);
  const telefone = textField(formData, "telefone", 40);
  const formaContato = textField(formData, "formaContato", 20);
  const dataNascimento = textField(formData, "dataNascimento", 10);
  const cidade = textField(formData, "cidade", 100);
  const estado = textField(formData, "estado", 60);
  const pais = textField(formData, "pais", 60);
  const territorio = textField(formData, "territorio", 120);
  const ofertas = pickAllowed(formData, "ofertas", OFFERS);
  const areasAtuacao = pickAllowed(formData, "areasAtuacao", VOLUNTEER_AREAS);
  const profissao = textField(formData, "profissao", 160);
  const formacao = textField(formData, "formacao", 200);
  const habilidades = textField(formData, "habilidades");
  const detalhesOferta = textField(formData, "detalhesOferta");
  const disponibilidade = textField(formData, "disponibilidade", 200);
  const modalidade = textField(formData, "modalidade", 40);
  const concordaTermos = isChecked(formData, "concordaTermos");

  if (
    !nomeCompleto ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    telefone.replace(/\D/g, "").length < 8 ||
    !(FORMAS_CONTATO as readonly string[]).includes(formaContato) ||
    (dataNascimento && !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) ||
    !cidade ||
    !pais ||
    !habilidades ||
    (modalidade && !(MODALIDADES as readonly string[]).includes(modalidade))
  ) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios do formulário." }, { status: 400 });
  }
  if (ofertas.length === 0) {
    return NextResponse.json({ error: "Marque pelo menos uma opção em “Posso oferecer”." }, { status: 400 });
  }
  if (areasAtuacao.length === 0) {
    return NextResponse.json({ error: "Selecione pelo menos uma área de atuação." }, { status: 400 });
  }
  if (!concordaTermos) {
    return NextResponse.json({ error: "É preciso autorizar o uso dos dados para enviar o cadastro." }, { status: 400 });
  }

  const fileEntry = formData.get("documento");
  let documento: null | {
    nome: string;
    path: string;
    contentType: string;
    size: number;
  } = null;

  const now = new Date().toISOString();
  const applicationRef = getAdminDb().collection("volunteer_applications").doc();

  if (isFile(fileEntry) && fileEntry.size > 0) {
    if (fileEntry.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `O arquivo excede o limite de ${MAX_UPLOAD_LABEL}.` },
        { status: 400 },
      );
    }

    const safeName = sanitizeFileName(fileEntry.name || "documento");
    const relativePath = `voluntarios/${applicationRef.id}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    await saveFile(relativePath, buffer);
    documento = {
      nome: fileEntry.name,
      path: relativePath,
      contentType: fileEntry.type || "application/octet-stream",
      size: buffer.length,
    };
  }

  await applicationRef.set({
    versao: 2,
    email,
    nomeCompleto,
    telefone,
    formaContato,
    dataNascimento: dataNascimento || null,
    endereco: { cidade, estado: estado || null, pais, territorio: territorio || null },
    ofertas,
    areasAtuacao,
    profissao: profissao || null,
    formacao: formacao || null,
    habilidades,
    detalhesOferta: detalhesOferta || null,
    disponibilidade: disponibilidade || null,
    modalidade: modalidade || null,
    documento,
    consentimentoEm: now,
    status: "novo",
    criadoEm: now,
    atualizadoEm: now,
  });

  await appendAuditLog({
    tipo: "voluntario_inscricao_enviada",
    ator: email,
    alvo: applicationRef.id,
    detalhes: { areasAtuacao, ofertas },
  });

  const notificationSent = await sendSystemEmailNotification({
    event: "nova inscrição de voluntariado",
    recordId: applicationRef.id,
    path: "/voluntarios",
  });

  return NextResponse.json({ ok: true, id: applicationRef.id, notificationSent });
}
