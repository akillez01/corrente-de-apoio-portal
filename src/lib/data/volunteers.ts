import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Role } from "@/lib/types/domain";

// Papéis da equipe que podem consultar o cadastro geral de voluntários.
export const VOLUNTEER_DIRECTORY_ROLES: Role[] = ["curador", "assistente_social", "admin"];

export interface VolunteerProfile {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  formaContato: string | null;
  cidade: string;
  estado: string | null;
  pais: string;
  ofertas: string[];
  areasAtuacao: string[];
  profissao: string | null;
  formacao: string | null;
  habilidades: string;
  detalhesOferta: string | null;
  disponibilidade: string | null;
  modalidade: string | null;
  documentoNome: string | null;
  documentoPath: string | null;
  criadoEm: string;
}

// Normaliza inscrições novas (versao 2) e antigas (formulário anterior a out/2026).
function toProfile(id: string, data: FirebaseFirestore.DocumentData): VolunteerProfile {
  const legacy = data.versao !== 2;
  const endereco = data.endereco ?? {};
  return {
    id,
    nome: data.nomeCompleto ?? "",
    email: data.email ?? "",
    telefone: data.telefone ?? "",
    formaContato: data.formaContato ?? null,
    cidade: endereco.cidade ?? "",
    estado: endereco.estado ?? null,
    pais: endereco.pais ?? "",
    ofertas: data.ofertas ?? [],
    areasAtuacao: data.areasAtuacao ?? [],
    profissao: legacy ? (data.qualificacoes?.experienciaProfissional ?? null) : data.profissao,
    formacao: legacy ? (data.qualificacoes?.formacaoAcademica ?? null) : data.formacao,
    habilidades: data.habilidades ?? "",
    detalhesOferta: legacy ? (data.interesses ?? null) : data.detalhesOferta,
    disponibilidade: legacy
      ? ([data.disponibilidade?.disponibilidade, data.disponibilidade?.tempoCompromisso].filter(Boolean).join(" · ") || null)
      : data.disponibilidade,
    modalidade: data.modalidade ?? null,
    documentoNome: data.documento?.nome ?? null,
    documentoPath: data.documento?.path ?? null,
    criadoEm: data.criadoEm ?? "",
  };
}

export async function getVolunteers(): Promise<VolunteerProfile[]> {
  const snapshot = await getAdminDb().collection("volunteer_applications").get();
  return snapshot.docs
    .map((doc) => toProfile(doc.id, doc.data()))
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function getVolunteer(id: string): Promise<VolunteerProfile | null> {
  const doc = await getAdminDb().collection("volunteer_applications").doc(id).get();
  return doc.exists ? toProfile(doc.id, doc.data() ?? {}) : null;
}
