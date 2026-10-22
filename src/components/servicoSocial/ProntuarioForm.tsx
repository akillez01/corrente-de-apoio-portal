"use client";

import type { SocialCase } from "@/lib/types/domain";
import { RESULTADO_LABEL, RESULTADOS_ENCERRAMENTO, type ResultadoEncerramento } from "@/lib/domain/encerramento";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FIELDS = [
  ["demandaApresentada", "Demanda apresentada"],
  ["sinteseSituacao", "Síntese da situação social"],
  ["avaliacaoSocial", "Avaliação social"],
  ["orientacaoRealizada", "Orientação realizada"],
  ["encaminhamentos", "Encaminhamentos"],
  ["planoIntervencao", "Plano de intervenção"],
  ["acompanhamento", "Acompanhamento"],
] as const;

type FieldKey = (typeof FIELDS)[number][0];

const TEXTAREA =
  "mt-1 min-h-[90px] w-full resize-y rounded-xl border border-border bg-white p-3 text-[13.5px] text-ink outline-none focus:border-primary";
const LABEL = "block text-[11.5px] font-semibold uppercase tracking-wider text-muted";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

export function ProntuarioForm({
  requestId,
  socialCase,
  initialDemanda,
}: {
  requestId: string;
  socialCase: SocialCase | null;
  initialDemanda: string;
}) {
  const router = useRouter();
  const [dataAtendimento, setDataAtendimento] = useState(
    socialCase?.dataAtendimento ?? new Date().toISOString().slice(0, 10),
  );
  const [values, setValues] = useState<Record<FieldKey, string>>(() =>
    Object.fromEntries(
      FIELDS.map(([key]) => [
        key,
        socialCase?.[key] ?? (key === "demandaApresentada" ? initialDemanda : ""),
      ]),
    ) as Record<FieldKey, string>,
  );
  const [evolucao, setEvolucao] = useState("");
  const [encerramento, setEncerramento] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const encerrado = socialCase?.status === "encerrado";

  async function send(action: string, extra: Record<string, unknown> = {}) {
    setLoading(action);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/servico-social/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Falha de conexão.");
      return false;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (await send("salvar", { dataAtendimento, ...values })) setMessage("Ficha salva.");
        }}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold">Ficha de atendimento</h2>
          {socialCase && (
            <div className="text-right text-[12px] text-muted">
              Profissional responsável: <b className="text-ink">{socialCase.profissionalResponsavel}</b>
              <button
                type="button"
                disabled={!!loading}
                onClick={() => send("assumir")}
                className="ml-2 underline hover:text-ink"
              >
                Assumir caso
              </button>
            </div>
          )}
        </div>
        <label className={LABEL}>
          Data do atendimento
          <input
            type="date"
            required
            value={dataAtendimento}
            onChange={(e) => setDataAtendimento(e.target.value)}
            className="mt-1 block rounded-xl border border-border bg-white px-3 py-2 text-[13.5px] text-ink outline-none focus:border-primary"
          />
        </label>
        {FIELDS.map(([key, label]) => (
          <label key={key} className={LABEL}>
            {label}
            <textarea
              maxLength={10000}
              value={values[key]}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              className={TEXTAREA}
            />
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!!loading}
            className="rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading === "salvar" ? "Salvando…" : socialCase ? "Salvar ficha" : "Abrir atendimento"}
          </button>
          {message && <span role="status" className="text-[13px] text-primary">{message}</span>}
        </div>
      </form>

      {socialCase && (
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5">
          <div>
            <h2 className="font-serif text-xl font-semibold">Evolução (acompanhamento)</h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Registros do acompanhamento ao longo do tempo: contatos, visitas, encaminhamentos feitos.
            </p>
          </div>
          {socialCase.evolucoes.length === 0 ? (
            <p className="text-[13px] text-muted">Nenhum registro de evolução ainda.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {socialCase.evolucoes.map((entry, index) => (
                <li key={index} className="rounded-lg border border-border bg-bg p-3 text-[13px]">
                  <div className="text-[11.5px] text-muted">
                    {formatDateTime(entry.data)} · {entry.autor}
                  </div>
                  <p className="mt-1 whitespace-pre-line">{entry.texto}</p>
                </li>
              ))}
            </ol>
          )}
          {!encerrado && (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (await send("evolucao", { texto: evolucao })) setEvolucao("");
              }}
              className="flex flex-col gap-2"
            >
              <label className={LABEL}>
                Novo registro de evolução
                <textarea required maxLength={10000} value={evolucao} onChange={(e) => setEvolucao(e.target.value)} className={TEXTAREA} />
              </label>
              <button
                type="submit"
                disabled={!!loading}
                className="w-fit rounded-[10px] border border-border bg-bg px-4 py-2 text-[13px] font-semibold disabled:opacity-60"
              >
                {loading === "evolucao" ? "Registrando…" : "Registrar evolução"}
              </button>
            </form>
          )}
        </section>
      )}

      {socialCase && (
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5">
          <div>
            <h2 className="font-serif text-xl font-semibold">Encerramento (desfecho do caso)</h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Diferente da evolução: aqui fica o resultado final — se a demanda foi atendida ou não e
              como o caso terminou. Use só quando o acompanhamento acabar.
            </p>
          </div>
          {encerrado && socialCase.encerramento ? (
            <>
              <div className="rounded-lg border border-border bg-bg p-3 text-[13px]">
                <div className="text-[11.5px] text-muted">
                  Encerrado em {formatDateTime(socialCase.encerramento.data)} · {socialCase.encerramento.autor}
                </div>
                <p className="mt-1 font-semibold">
                  Resultado:{" "}
                  {RESULTADO_LABEL[socialCase.encerramento.resultado as ResultadoEncerramento] ?? "não informado"}
                </p>
                <p className="mt-1 whitespace-pre-line">{socialCase.encerramento.texto}</p>
              </div>
              <button
                type="button"
                disabled={!!loading}
                onClick={() => send("reabrir")}
                className="w-fit rounded-[10px] border border-border bg-bg px-4 py-2 text-[13px] font-semibold disabled:opacity-60"
              >
                {loading === "reabrir" ? "Reabrindo…" : "Reabrir atendimento"}
              </button>
            </>
          ) : (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (await send("encerrar", { texto: encerramento, resultado })) {
                  setEncerramento("");
                  setResultado("");
                }
              }}
              className="flex flex-col gap-2"
            >
              <label className={LABEL}>
                Resultado do atendimento *
                <select
                  required
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13.5px] normal-case tracking-normal text-ink outline-none focus:border-primary"
                >
                  <option value="">Selecione</option>
                  {RESULTADOS_ENCERRAMENTO.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={LABEL}>
                Como ficou o caso *
                <textarea
                  required
                  maxLength={10000}
                  value={encerramento}
                  onChange={(e) => setEncerramento(e.target.value)}
                  placeholder="Ex.: família recebeu 3 cestas e foi inscrita no CRAS; renda estabilizada com trabalho formal."
                  className={TEXTAREA}
                />
              </label>
              <button
                type="submit"
                disabled={!!loading}
                className="w-fit rounded-[10px] border border-[#F2CBB5] bg-white px-4 py-2 text-[13px] font-semibold text-urgent disabled:opacity-60"
              >
                {loading === "encerrar" ? "Encerrando…" : "Encerrar atendimento"}
              </button>
            </form>
          )}
        </section>
      )}

      {error && <p role="alert" className="text-[13px] text-urgent">{error}</p>}
    </div>
  );
}
