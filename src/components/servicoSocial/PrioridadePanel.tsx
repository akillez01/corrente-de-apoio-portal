"use client";

import { PRIORIDADE_LABEL, PRIORIDADES, type Prioridade } from "@/lib/domain/prioridade";
import type { SocialPriority } from "@/lib/types/domain";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STYLE: Record<Prioridade, string> = {
  normal: "border-border bg-bg text-ink",
  alta: "border-[#EBD9A8] bg-[#FDF3DC] text-[#8A6414]",
  urgente: "border-[#F2CBB5] bg-[#FDECE3] text-urgent",
};

// A assistente social define a prioridade do caso; ela vale para as filas e para a campanha.
export function PrioridadePanel({
  requestId,
  prioridade,
  urgenteInformado,
}: {
  requestId: string;
  prioridade: SocialPriority | null;
  urgenteInformado: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Prioridade | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function definir(nivel: Prioridade) {
    setBusy(nivel);
    setError(null);
    try {
      const response = await fetch(`/api/servico-social/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prioridade", nivel }),
      });
      if (!response.ok) {
        setError((await response.json()).error ?? "Não foi possível salvar a prioridade.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5">
      <div>
        <h2 className="font-serif text-xl font-semibold">Prioridade do caso</h2>
        <p className="mt-1 text-[12.5px] text-muted">
          Sua avaliação define a ordem nas filas e se a campanha aparece como urgente.
          {" "}No cadastro, a pessoa marcou: <b>{urgenteInformado ? "situação urgente" : "não urgente"}</b>.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRIORIDADES.map((nivel) => {
          const selected = prioridade?.nivel === nivel;
          return (
            <button
              key={nivel}
              type="button"
              aria-pressed={selected}
              disabled={!!busy}
              onClick={() => definir(nivel)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition disabled:opacity-60 ${
                selected ? `${STYLE[nivel]} ring-2 ring-primary/40` : "border-border bg-white text-muted hover:border-primary"
              }`}
            >
              {busy === nivel ? "Salvando…" : PRIORIDADE_LABEL[nivel]}
              {selected && " ✓"}
            </button>
          );
        })}
      </div>
      <p className="text-[12px] text-muted">
        {prioridade
          ? `Definida por ${prioridade.por} em ${new Date(prioridade.em).toLocaleString("pt-BR")}.`
          : "Ainda não avaliada pelo Serviço Social."}
      </p>
      {error && <p role="alert" className="text-[13px] text-urgent">{error}</p>}
    </section>
  );
}
