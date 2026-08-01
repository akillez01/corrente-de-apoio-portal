import type { CampaignStatus } from "@/lib/types/domain";

export type TrailStepState = "concluido" | "atual" | "futuro";

export interface TrailStep {
  label: string;
  sublabel: string;
  state: TrailStepState;
}

const ARRECADACAO_ENCERRADA: CampaignStatus[] = [
  "repasse_pendente",
  "repassado",
  "prestacao_publicada",
  "encerrado",
];
const REPASSE_FEITO: CampaignStatus[] = ["repassado", "prestacao_publicada", "encerrado"];
const PRESTACAO_FEITA: CampaignStatus[] = ["prestacao_publicada", "encerrado"];

export function buildTrail(status: CampaignStatus): TrailStep[] {
  const arrecadacaoEncerrada = ARRECADACAO_ENCERRADA.includes(status);
  const repasseFeito = REPASSE_FEITO.includes(status);
  const prestacaoFeita = PRESTACAO_FEITA.includes(status);

  return [
    {
      label: "Pedido recebido e analisado",
      sublabel: "Equipe social entrou em contato com a família",
      state: "concluido",
    },
    {
      label: "Campanha aprovada e publicada",
      sublabel: "Texto revisado em conjunto com a família",
      state: "concluido",
    },
    {
      label: "Arrecadação em andamento",
      sublabel: "Atualizado automaticamente a cada doação confirmada",
      state: arrecadacaoEncerrada ? "concluido" : "atual",
    },
    {
      label: "Repasse ao beneficiário",
      sublabel: "Realizado pelo financeiro ao fim da campanha, com comprovante anexado",
      state: repasseFeito ? "concluido" : arrecadacaoEncerrada ? "atual" : "futuro",
    },
    {
      label: "Prestação de contas pública",
      sublabel: "Extrato consolidado e comprovante publicados nesta página",
      state: prestacaoFeita ? "concluido" : repasseFeito ? "atual" : "futuro",
    },
  ];
}
