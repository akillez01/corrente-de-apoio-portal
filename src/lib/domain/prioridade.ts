// Prioridade do caso definida pelo Serviço Social. Substitui a marcação "urgente" que a
// própria pessoa faz no cadastro: é a avaliação social que ordena as filas e marca a campanha.
export const PRIORIDADES = ["normal", "alta", "urgente"] as const;
export type Prioridade = (typeof PRIORIDADES)[number];

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORIDADE_ORDEM: Record<Prioridade, number> = { urgente: 0, alta: 1, normal: 2 };

export function isPrioridade(value: unknown): value is Prioridade {
  return typeof value === "string" && (PRIORIDADES as readonly string[]).includes(value);
}
