"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SupportRequest } from "@/lib/types/domain";
import { formatBRL } from "@/lib/format";

// Aceita "600", "600,50", "1.200,00", "R$ 1200.5". Campo de texto em vez de type="number":
// no Firefox em pt-BR um número digitado com vírgula chegava vazio ao formulário.
function parseMeta(value: string): number {
  let clean = value.replace(/[R$\s]/g, "");
  if (clean.includes(",")) clean = clean.replace(/\./g, "").replace(",", ".");
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : NaN;
}

const FIELD =
  "mt-1 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13.5px] normal-case tracking-normal text-ink outline-none focus:border-primary";

export function CuradoriaActions({ request }: { request: SupportRequest }) {
  const router = useRouter();
  const [textoPublico, setTextoPublico] = useState(request.textoPublico);
  const [titulo, setTitulo] = useState(request.titulo);
  const [meta, setMeta] = useState(request.meta > 0 ? String(request.meta).replace(".", ",") : "");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const metaValue = parseMeta(meta);

  async function runAction(action: "reprovar" | "alinhar" | "aprovar") {
    setError(null);
    if (action === "aprovar") {
      const faltando = [
        !titulo.trim() && "titulo",
        !(metaValue > 0) && "meta",
        !textoPublico.trim() && "texto",
      ].filter((item): item is string => Boolean(item));
      setMissing(faltando);
      if (faltando.length) {
        setError("Para aprovar, preencha os campos destacados: título, meta (em reais) e texto público.");
        return;
      }
    }
    setLoading(action);
    try {
      const res = await fetch(`/api/curadoria/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, textoPublico, mensagem, titulo, meta: metaValue > 0 ? metaValue : 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível concluir a ação.");
        return;
      }
      router.push(action === "aprovar" ? "/curadoria?aprovado=1" : "/curadoria");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  const border = (field: string) => (missing.includes(field) ? "border-urgent" : "border-border");

  return (
    <div>
      <p className="mb-3 text-[12.5px] text-muted">
        Para <b>aprovar como campanha</b>, preencha título, meta e texto público (obrigatórios).
        Para reprovar ou enviar para alinhamento, eles não são necessários.
      </p>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
        <label className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          Título público da campanha *
          <input
            value={titulo}
            maxLength={140}
            onChange={(e) => setTitulo(e.target.value)}
            className={`${FIELD} ${border("titulo")}`}
          />
        </label>
        <label className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          Meta (R$) *
          <input
            inputMode="decimal"
            value={meta}
            placeholder="Ex.: 600,00"
            onChange={(e) => setMeta(e.target.value)}
            className={`${FIELD} ${border("meta")}`}
          />
          <span className="mt-1 block text-[11px] normal-case tracking-normal">
            {meta && metaValue > 0 ? `= R$ ${formatBRL(metaValue)}` : meta ? "Valor inválido" : ""}
          </span>
        </label>
      </div>
      <h4 className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
        Texto público revisado pela curadoria *
      </h4>
      <textarea
        value={textoPublico}
        onChange={(e) => setTextoPublico(e.target.value)}
        placeholder="Texto que aparecerá na página da campanha. Separe parágrafos com uma linha em branco."
        className={`mb-4 min-h-[140px] w-full resize-y rounded-xl border bg-white p-3.5 text-[13.5px] outline-none focus:border-primary ${border("texto")}`}
      />
      <h4 className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
        Mensagem para o requerente (opcional, usada ao enviar para alinhamento)
      </h4>
      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Ex.: preciso do orçamento atualizado da clínica para seguir com a análise."
        className="mb-4 min-h-[70px] w-full resize-y rounded-xl border border-border bg-white p-3.5 text-[13.5px] outline-none focus:border-primary"
      />
      {error && (
        <p role="alert" className="mb-3 rounded-lg border border-[#F2CBB5] bg-[#FDECE3] p-3 text-[13px] text-urgent">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2.5">
        <button
          disabled={!!loading}
          onClick={() => runAction("reprovar")}
          className="rounded-[10px] border border-[#F2CBB5] bg-white px-4.5 py-2.5 text-[13px] font-semibold text-urgent disabled:opacity-60"
        >
          {loading === "reprovar" ? "Reprovando…" : "Reprovar"}
        </button>
        <button
          disabled={!!loading}
          onClick={() => runAction("alinhar")}
          className="rounded-[10px] border border-border bg-bg px-4.5 py-2.5 text-[13px] font-semibold text-ink disabled:opacity-60"
        >
          {loading === "alinhar" ? "Enviando…" : "Enviar para alinhamento"}
        </button>
        <button
          disabled={!!loading}
          onClick={() => runAction("aprovar")}
          className="rounded-[10px] bg-primary px-4.5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading === "aprovar" ? "Aprovando…" : "Aprovar para publicação"}
        </button>
      </div>
    </div>
  );
}
