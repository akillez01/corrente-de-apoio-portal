import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { MAX_ATTACHMENTS_PER_REQUEST, uploadAttachment } from "@/lib/storage/attachments";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/storage/limits";
import { appendAuditLog } from "@/lib/audit";
import { sendSystemEmailNotification } from "@/lib/notifications/systemEmail";
import {
  CATEGORIAS_DEMANDA,
  FAIXAS_RENDA,
  FAMILY_FIELDS,
  FORMAS_CONTATO,
  SITUACOES_ALIMENTARES,
  SITUACOES_HABITACIONAIS,
  SITUACOES_TRABALHO,
  SOCIOECONOMIC_FIELDS,
} from "@/lib/domain/acolhimento";

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

const TEXT_LIMIT = 1_500;

function text(formData: FormData, key: string, max = TEXT_LIMIT): string | null {
  const value = String(formData.get(key) ?? "").trim();
  if (value.length > max) throw new RangeError(key);
  return value;
}

function optionalGroup<K extends string>(
  formData: FormData,
  prefix: string,
  keys: readonly K[],
  allowed: Partial<Record<K, readonly string[]>> = {},
): Record<K, string | null> | null {
  const group = {} as Record<K, string | null>;
  let filled = false;
  for (const key of keys) {
    const value = text(formData, `${prefix}.${key}`) ?? "";
    const options = allowed[key];
    if (value && options && !options.includes(value)) throw new RangeError(key);
    group[key] = value || null;
    if (value) filled = true;
  }
  return filled ? group : null;
}

function ageFrom(dataNascimento: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) return null;
  const birth = new Date(`${dataNascimento}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age <= 120 ? age : null;
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "requerente" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulário inválido." }, { status: 400 });
  }

  let fields;
  try {
    const dataNascimento = text(formData, "dataNascimento", 10) ?? "";
    fields = {
      nome: text(formData, "nome", 120) ?? "",
      email: text(formData, "email", 160) ?? "",
      nomeSocial: text(formData, "nomeSocial", 120) ?? "",
      dataNascimento,
      idade: dataNascimento ? ageFrom(dataNascimento) : null,
      municipio: text(formData, "municipio", 100) ?? "",
      territorio: text(formData, "territorio", 120) ?? "",
      contato: text(formData, "contato", 160) ?? "",
      formaContato: String(formData.get("formaContato") ?? ""),
      composicaoFamiliar: optionalGroup(formData, "familia", FAMILY_FIELDS),
      situacaoSocioeconomica: optionalGroup(formData, "socio", SOCIOECONOMIC_FIELDS, {
        situacaoTrabalho: SITUACOES_TRABALHO,
        renda: FAIXAS_RENDA,
        situacaoAlimentar: SITUACOES_ALIMENTARES,
        situacaoHabitacional: SITUACOES_HABITACIONAIS,
      }),
      descricao: text(formData, "descricao", 5_000) ?? "",
    };
  } catch {
    return NextResponse.json({ error: "Há campos com conteúdo inválido ou longo demais." }, { status: 400 });
  }
  const categorias = [...new Set(formData.getAll("categorias").map(String))];
  const urgente = formData.get("urgente") === "true";
  const consentimentoLgpd = formData.get("consentimentoLgpd") === "true";
  const anexos = formData.getAll("anexos").filter((f): f is File => isFile(f) && f.size > 0);
  const { nome, email, municipio, contato, formaContato, descricao } = fields;

  if (
    !nome ||
    !municipio ||
    !descricao ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !contato ||
    !(FORMAS_CONTATO as readonly string[]).includes(formaContato) ||
    (formaContato === "E-mail" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contato)) ||
    (formaContato !== "E-mail" && contato.replace(/\D/g, "").length < 8) ||
    (fields.dataNascimento && fields.idade === null) ||
    categorias.length === 0 ||
    categorias.some((categoria) => !(CATEGORIAS_DEMANDA as readonly string[]).includes(categoria))
  ) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
  }
  if (!consentimentoLgpd) {
    return NextResponse.json(
      { error: "É necessário consentir com o tratamento dos dados (LGPD) para enviar o cadastro." },
      { status: 400 },
    );
  }
  if (anexos.length > MAX_ATTACHMENTS_PER_REQUEST) {
    return NextResponse.json(
      { error: `Envie no máximo ${MAX_ATTACHMENTS_PER_REQUEST} anexos.` },
      { status: 400 },
    );
  }

  if (anexos.reduce((sum, f) => sum + f.size, 0) > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `O total dos anexos não pode passar de ${MAX_UPLOAD_LABEL}.` },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  const requestRef = db.collection("requests").doc();
  // Falha no armazenamento de anexos não pode custar o cadastro de quem pede ajuda:
  // o pedido é salvo sem os arquivos, a pessoa é avisada e o erro fica só no log.
  const attachments = [];
  let anexosFalharam = false;
  try {
    for (const file of anexos) {
      attachments.push(await uploadAttachment(requestRef.id, file));
    }
  } catch (error) {
    console.error("Falha ao salvar anexos do pedido", requestRef.id, error);
    anexosFalharam = true;
  }

  const now = new Date().toISOString();
  // Título, categoria principal e meta são provisórios: a curadoria define título e
  // meta definitivos apenas se o acolhimento resultar em uma campanha.
  const titulo = `Acolhimento — ${categorias.slice(0, 3).join(", ")}${categorias.length > 3 ? "…" : ""}`;
  await requestRef.set({
    requerenteId: user.uid,
    requerenteNome: nome,
    identificacao: {
      nome,
      nomeSocial: fields.nomeSocial || null,
      idade: fields.idade,
      dataNascimento: fields.dataNascimento || null,
      email,
      municipio,
      territorio: fields.territorio || null,
      contato,
      formaContato,
    },
    composicaoFamiliar: fields.composicaoFamiliar,
    situacaoSocioeconomica: fields.situacaoSocioeconomica,
    titulo,
    categoria: categorias[0],
    categorias,
    urgente,
    meta: 0,
    prazo: null,
    descricao,
    textoPublico: "",
    anexos: attachments,
    anexosNaoSalvos: anexosFalharam ? anexos.map((file) => file.name) : [],
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

  const notificationSent = await sendSystemEmailNotification({
    event: "novo cadastro de acolhimento",
    recordId: requestRef.id,
    path: `/curadoria/${requestRef.id}`,
  });

  return NextResponse.json({ ok: true, id: requestRef.id, notificationSent, anexosFalharam });
}
