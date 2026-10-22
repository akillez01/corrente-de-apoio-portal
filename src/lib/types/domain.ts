export type Role = "requerente" | "curador" | "assistente_social" | "financeiro" | "editor_conteudo" | "admin";

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
  publicadoPor?: string;
  publicadoPorUid?: string;
  publicadoEm?: string;
  imageUrl?: string | null;
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

export interface RequestIdentification {
  nome: string;
  nomeSocial?: string | null;
  idade?: number | null;
  dataNascimento?: string | null;
  email?: string | null;
  municipio: string;
  territorio?: string | null;
  contato: string;
  formaContato: "E-mail" | "Telefone" | "WhatsApp";
}

// Módulo 2 do cadastro de acolhimento — opcional.
export interface RequestFamilyComposition {
  integrantes?: string | null;
  faixaEtaria?: string | null;
  dependentes?: string | null;
  composicaoDomiciliar?: string | null;
  outrasInformacoes?: string | null;
}

// Módulo 3 — opcional; o Serviço Social pode coletar depois, quando necessário.
export interface RequestSocioeconomicSituation {
  situacaoTrabalho?: string | null;
  renda?: string | null;
  fontesRenda?: string | null;
  beneficios?: string | null;
  despesasEssenciais?: string | null;
  situacaoAlimentar?: string | null;
  situacaoHabitacional?: string | null;
}

// Encaminhamento do Serviço Social para a curadoria avaliar uma campanha pública.
export interface CampaignReferral {
  por: string;
  porUid: string;
  em: string;
  justificativa: string;
}

// Prioridade atribuída pela assistente social (ver src/lib/domain/prioridade.ts).
export interface SocialPriority {
  nivel: "normal" | "alta" | "urgente";
  por: string;
  porUid: string;
  em: string;
}

export interface SupportRequest {
  id: string;
  requerenteId: string;
  requerenteNome: string;
  identificacao?: RequestIdentification;
  composicaoFamiliar?: RequestFamilyComposition | null;
  situacaoSocioeconomica?: RequestSocioeconomicSituation | null;
  titulo: string;
  categoria: string;
  categorias?: string[];
  urgente: boolean;
  meta: number;
  prazo?: string;
  descricao: string;
  formasOferta?: string[];
  querParticipar?: boolean;
  detalhesOferta?: string | null;
  querConversarComServicoSocial?: boolean;
  textoPublico: string;
  anexos: Attachment[];
  anexosNaoSalvos?: string[];
  encaminhamentoCampanha?: CampaignReferral | null;
  prioridadeSocial?: SocialPriority | null;
  urgenteInformadoPeloRequerente?: boolean;
  consentimentoLgpdEm: string;
  status: RequestStatus;
  curadorId?: string;
  motivoReprovacao?: string;
  mensagens: RequestMessage[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface SocialCaseEntry {
  data: string;
  texto: string;
  autor: string;
  autorUid: string;
}

// Prontuário do Serviço Social, um por pedido (id = id do pedido).
// Acesso restrito a assistente_social e admin.
export interface SocialCase {
  id: string;
  requestId: string;
  status: "aberto" | "encerrado";
  dataAtendimento: string;
  profissionalResponsavel: string;
  profissionalResponsavelUid: string;
  demandaApresentada: string;
  sinteseSituacao: string;
  avaliacaoSocial: string;
  orientacaoRealizada: string;
  encaminhamentos: string;
  planoIntervencao: string;
  acompanhamento: string;
  evolucoes: SocialCaseEntry[];
  encerramento: SocialCaseEntry | null;
  criadoEm: string;
  atualizadoEm: string;
}

export type ModerationStatus = "pendente" | "aprovado" | "reprovado";

// Projeto enviado em "Projetar". Só aparece no portal depois de aprovado.
export interface CommunityProject {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  descricao: string;
  local: string;
  apoiosNecessarios: string[];
  linkExterno: string | null;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelTelefone: string | null;
  status: ModerationStatus;
  moderadoPor?: string;
  moderadoEm?: string;
  publicadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Ponto do Santo Daime cadastrado em "Integrar". Só aparece depois de aprovado.
export interface DaimePoint {
  id: string;
  nome: string;
  localizacao: string;
  municipio: string;
  estado: string | null;
  pais: string;
  contatoAcolhimento: string;
  siteOuInstagram: string | null;
  cadastradoPorEmail: string;
  status: ModerationStatus;
  moderadoPor?: string;
  moderadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Matéria de "Notícias", cadastrada pelo painel. Só as publicadas aparecem no portal.
export interface NewsArticle {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  corpo: string;
  imageUrl: string;
  imageAlt: string;
  dataPublicacao: string;
  status: "rascunho" | "publicado";
  autor: string;
  criadoEm: string;
  atualizadoEm: string;
}
