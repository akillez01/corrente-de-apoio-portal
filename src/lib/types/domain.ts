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
