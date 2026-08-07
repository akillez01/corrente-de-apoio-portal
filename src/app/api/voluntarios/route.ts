import { appendAuditLog } from "@/lib/audit";
import { getAdminDb } from "@/lib/firebase/admin";
import { saveFile } from "@/lib/storage/localStorage";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function textField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isChecked(formData: FormData, key: string) {
  return formData.get(key) === "sim";
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

function countWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const email = textField(formData, "email");
  const nomeCompleto = textField(formData, "nomeCompleto");
  const telefone = textField(formData, "telefone");
  const dataNascimento = textField(formData, "dataNascimento");
  const sexo = textField(formData, "sexo");
  const estadoCivil = textField(formData, "estadoCivil");
  const possuiFilhos = textField(formData, "possuiFilhos");

  const enderecoCompleto = textField(formData, "enderecoCompleto");
  const cidade = textField(formData, "cidade");
  const estado = textField(formData, "estado");
  const pais = textField(formData, "pais");

  const formacaoAcademica = textField(formData, "formacaoAcademica");
  const experienciaProfissional = textField(formData, "experienciaProfissional");
  const experienciaVoluntariado = textField(formData, "experienciaVoluntariado");
  const situacaoTrabalho = textField(formData, "situacaoTrabalho");

  const motivacao = textField(formData, "motivacao");
  const experienciaAmazonia = textField(formData, "experienciaAmazonia");

  const disponibilidade = textField(formData, "disponibilidade");
  const tempoCompromisso = textField(formData, "tempoCompromisso");
  const morarComunidade = textField(formData, "morarComunidade");
  const arcariaLogistica = textField(formData, "arcariaLogistica");

  const habilidades = textField(formData, "habilidades");
  const interesses = textField(formData, "interesses");

  const referencias = textField(formData, "referencias");
  const consideracoesEspeciais = textField(formData, "consideracoesEspeciais");

  const concordaTermos = isChecked(formData, "concordaTermos");
  const declaraVerdade = isChecked(formData, "declaraVerdade");

  const required = [
    email,
    nomeCompleto,
    telefone,
    dataNascimento,
    sexo,
    estadoCivil,
    possuiFilhos,
    enderecoCompleto,
    cidade,
    estado,
    pais,
    formacaoAcademica,
    situacaoTrabalho,
    motivacao,
    experienciaAmazonia,
    disponibilidade,
    tempoCompromisso,
    morarComunidade,
    arcariaLogistica,
    habilidades,
    interesses,
  ];

  if (required.some((value) => !value)) {
    return NextResponse.json(
      { error: "Preencha todos os campos obrigatorios do formulario." },
      { status: 400 },
    );
  }

  if (!concordaTermos || !declaraVerdade) {
    return NextResponse.json(
      { error: "Voce precisa concordar com os termos e com a declaracao final." },
      { status: 400 },
    );
  }

  if (countWords(motivacao) > 200) {
    return NextResponse.json(
      { error: "A resposta de motivacao deve ter no maximo 200 palavras." },
      { status: 400 },
    );
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
        { error: "O arquivo excede o limite de 10MB." },
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
    email,
    nomeCompleto,
    telefone,
    dataNascimento,
    sexo,
    estadoCivil,
    possuiFilhos,
    endereco: {
      enderecoCompleto,
      cidade,
      estado,
      pais,
    },
    qualificacoes: {
      formacaoAcademica,
      experienciaProfissional,
      experienciaVoluntariado,
      situacaoTrabalho,
    },
    motivacao,
    experienciaAmazonia,
    disponibilidade: {
      disponibilidade,
      tempoCompromisso,
      morarComunidade,
      arcariaLogistica,
    },
    habilidades,
    interesses,
    referencias,
    consideracoesEspeciais,
    documento,
    termos: {
      concordaTermos,
      declaraVerdade,
    },
    status: "novo",
    criadoEm: now,
    atualizadoEm: now,
  });

  await appendAuditLog({
    tipo: "voluntario_inscricao_enviada",
    ator: email,
    alvo: applicationRef.id,
    detalhes: { morarComunidade, arcariaLogistica },
  });

  return NextResponse.json({ ok: true, id: applicationRef.id });
}
