// Acompanhamento do pedido do ponto de vista de quem pediu ajuda: etapas e status em
// linguagem simples. Nunca expõe o prontuário do Serviço Social — só etapas e o resultado.
import { RESULTADO_LABEL, type ResultadoEncerramento } from "@/lib/domain/encerramento";
import type { CampaignReferral, CampaignStatus, RequestStatus } from "@/lib/types/domain";

const PUBLIC_CAMPAIGN: CampaignStatus[] = [
  "publicado",
  "meta_atingida",
  "prazo_encerrado",
  "repasse_pendente",
  "repassado",
  "prestacao_publicada",
  "encerrado",
];

export interface TrackingInput {
  status: RequestStatus;
  criadoEm: string;
  encaminhamentoCampanha?: CampaignReferral | null;
  caso: { status: "aberto" | "encerrado"; resultado: string | null; encerradoEm: string | null } | null;
  campanha: { status: CampaignStatus; slug: string } | null;
}

export type Tone = "neutral" | "progress" | "action" | "done" | "stopped";

export function friendlyStatus(input: TrackingInput): { label: string; tone: Tone } {
  if (input.status === "arquivado") return { label: "Cancelado", tone: "stopped" };
  if (input.caso?.status === "encerrado") return { label: "Atendimento concluído", tone: "done" };
  if (input.campanha && PUBLIC_CAMPAIGN.includes(input.campanha.status)) {
    return { label: "Campanha publicada", tone: "done" };
  }
  if (input.campanha) return { label: "Campanha aprovada", tone: "progress" };
  if (input.status === "em_alinhamento") return { label: "Aguardando sua resposta", tone: "action" };
  if (input.status === "reprovado") return { label: "Em acompanhamento", tone: "progress" };
  if (input.encaminhamentoCampanha) return { label: "Campanha em análise", tone: "progress" };
  if (input.caso?.status === "aberto") return { label: "Em acompanhamento", tone: "progress" };
  return { label: "Recebido — aguardando acolhimento", tone: "neutral" };
}

export interface TimelineStep {
  title: string;
  detail: string;
  state: "done" | "current" | "upcoming" | "info";
  href?: string;
}

const date = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "");

export function buildTimeline(input: TrackingInput): TimelineStep[] {
  const steps: TimelineStep[] = [
    { title: "Cadastro recebido", detail: `Enviado em ${date(input.criadoEm)}.`, state: "done" },
  ];

  if (input.status === "arquivado") {
    steps.push({ title: "Pedido cancelado", detail: "O pedido foi cancelado e não segue mais em atendimento.", state: "info" });
    return steps;
  }

  steps.push(
    input.caso
      ? {
          title: "Acolhimento pelo Serviço Social",
          detail:
            input.caso.status === "aberto"
              ? "Uma assistente social está acompanhando o seu caso."
              : "O Serviço Social acompanhou o seu caso.",
          state: input.caso.status === "aberto" ? "current" : "done",
        }
      : {
          title: "Acolhimento pelo Serviço Social",
          detail: "A equipe vai analisar o seu cadastro e entrar em contato pela forma que você escolheu.",
          state: "current",
        },
  );

  if (input.encaminhamentoCampanha || input.campanha) {
    const published = input.campanha && PUBLIC_CAMPAIGN.includes(input.campanha.status);
    steps.push({
      title: "Campanha de arrecadação",
      detail: published
        ? "A campanha está publicada no site. Você pode compartilhar o link."
        : input.campanha
          ? "A campanha foi aprovada e está sendo preparada para publicação."
          : input.status === "em_alinhamento"
            ? "A equipe precisa de mais informações. Veja as mensagens abaixo e responda."
            : input.status === "reprovado"
              ? "Neste momento não será aberta uma campanha pública. O acompanhamento continua."
              : "O seu caso foi encaminhado para avaliar uma campanha de arrecadação.",
      state: published ? "done" : input.status === "reprovado" ? "info" : "current",
      href: published && input.campanha ? `/pt/campanha/${input.campanha.slug}` : undefined,
    });
  }

  steps.push(
    input.caso?.status === "encerrado"
      ? {
          title: "Atendimento concluído",
          detail: `${
            RESULTADO_LABEL[input.caso.resultado as ResultadoEncerramento] ?? "Atendimento encerrado"
          }${input.caso.encerradoEm ? ` · ${date(input.caso.encerradoEm)}` : ""}.`,
          state: "done",
        }
      : { title: "Atendimento concluído", detail: "Quando o acompanhamento terminar, o resultado aparece aqui.", state: "upcoming" },
  );

  return steps;
}
