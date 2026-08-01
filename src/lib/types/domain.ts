export type Role = "requerente" | "curador" | "financeiro" | "admin";

export type CampaignStatus =
  | "rascunho"
  | "submetido"
  | "em_analise"
  | "em_alinhamento"
  | "aprovado"
  | "publicado"
  | "meta_atingida"
  | "prazo_encerrado"
  | "repasse_pendente"
  | "repassado"
  | "prestacao_publicada"
  | "encerrado"
  | "reprovado"
  | "arquivado";

export type DonationMethod = "pix" | "paypal";

export interface Campaign {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  urgente: boolean;
  resumoPublico: string;
  textoPublico: string[];
  meta: number;
  arrecadado: number;
  moeda: "BRL";
  status: CampaignStatus;
  doacoesCount: number;
  prazo?: string;
  verificadoEm: string;
  aprovadoPor: string;
  aprovadoPorUid?: string;
  requestId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  valor: number;
  moeda: "BRL" | "EUR" | "USD";
  metodo: DonationMethod;
  anonimo: boolean;
  nome?: string;
  externalId: string;
  criadoEm: string;
}

export interface Transfer {
  id: string;
  campaignId: string;
  valor: number;
  data: string;
  comprovanteUrl?: string;
  confirmadoPor: string;
}

export type RequestStatus =
  | "submetido"
  | "em_analise"
  | "em_alinhamento"
  | "aprovado"
  | "reprovado"
  | "arquivado";

export interface Attachment {
  nome: string;
  path: string;
  contentType: string;
  size: number;
}

export interface RequestMessage {
  autor: string;
  texto: string;
  criadoEm: string;
}

export interface SupportRequest {
  id: string;
  requerenteId: string;
  requerenteNome: string;
  titulo: string;
  categoria: string;
  urgente: boolean;
  meta: number;
  prazo?: string;
  descricao: string;
  textoPublico: string;
  anexos: Attachment[];
  consentimentoLgpdEm: string;
  status: RequestStatus;
  curadorId?: string;
  motivoReprovacao?: string;
  mensagens: RequestMessage[];
  criadoEm: string;
  atualizadoEm: string;
}
