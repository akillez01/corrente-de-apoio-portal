"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SupportRequest } from "@/lib/types/domain";

export function CuradoriaActions({ request }: { request: SupportRequest }) {
  const router = useRouter();
  const [textoPublico, setTextoPublico] = useState(request.textoPublico);
  const [titulo, setTitulo] = useState(request.titulo);
  const [meta, setMeta] = useState(request.meta > 0 ? String(request.meta) : "");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: "reprovar" | "alinhar" | "aprovar") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/curadoria/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, textoPublico, mensagem, titulo, meta: Number(meta) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível concluir a ação.");
        return;
      }
      router.push(action === "aprovar" ? "/curadoria?aprovado=1" : "/curadoria");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
        <label className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          Título público da campanha
          <input
            value={titulo}
            maxLength={140}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[13.5px] normal-case tracking-normal text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          Meta (R$)
          <input
            type="number"
            min={1}
            step="0.01"
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
          />
        </label>
      </div>
      <h4 className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
        Texto público revisado pela curadoria
      </h4>
      <textarea
        value={textoPublico}
        onChange={(e) => setTextoPublico(e.target.value)}
        className="mb-4 min-h-[140px] w-full resize-y rounded-xl border border-border bg-white p-3.5 text-[13.5px] outline-none focus:border-primary"
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
      {error && <p className="mb-3 text-[13px] text-urgent">{error}</p>}
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
