// Desfecho registrado ao encerrar um atendimento do Serviço Social. A evolução registra o
// acompanhamento ao longo do tempo; o encerramento registra como o caso terminou.
export const RESULTADOS_ENCERRAMENTO = [
  ["atendida", "Demanda atendida"],
  ["parcial", "Atendida parcialmente"],
  ["encaminhada", "Encaminhada para outra rede ou serviço"],
  ["nao_atendida", "Não foi possível atender"],
  ["sem_contato", "Sem contato com a pessoa"],
  ["desistencia", "A pessoa desistiu ou não precisa mais"],
  ["outro", "Outro"],
] as const;

export type ResultadoEncerramento = (typeof RESULTADOS_ENCERRAMENTO)[number][0];

export const RESULTADO_LABEL = Object.fromEntries(RESULTADOS_ENCERRAMENTO) as Record<ResultadoEncerramento, string>;

export function isResultado(value: unknown): value is ResultadoEncerramento {
  return typeof value === "string" && value in RESULTADO_LABEL;
}

// Resultados considerados positivos, para o selo verde na lista.
export const RESULTADOS_POSITIVOS: ResultadoEncerramento[] = ["atendida", "parcial", "encaminhada"];
