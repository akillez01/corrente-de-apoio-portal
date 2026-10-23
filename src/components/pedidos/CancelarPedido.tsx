"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelarPedido({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelar() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/pedidos/${requestId}/cancelar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      if (!response.ok) {
        setError((await response.json()).error ?? "Não foi possível cancelar.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[13px] text-muted underline hover:text-urgent">
        Não preciso mais de ajuda — cancelar pedido
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#F2CBB5] bg-[#FDECE3] p-3 text-[13px]">
      <label className="font-semibold text-urgent">
        Quer nos contar o motivo? (opcional)
        <textarea
          maxLength={1000}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="mt-1 min-h-[60px] w-full rounded-lg border border-border bg-white p-2.5 text-[13px] font-normal text-ink"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={cancelar} className="rounded-[10px] bg-urgent px-4 py-2 font-semibold text-white disabled:opacity-60">
          {busy ? "Cancelando…" : "Confirmar cancelamento"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-[10px] border border-border bg-white px-4 py-2 font-semibold">
          Voltar
        </button>
      </div>
      {error && <p role="alert" className="text-urgent">{error}</p>}
    </div>
  );
}
