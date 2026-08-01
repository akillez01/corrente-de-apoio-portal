"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmarRepasseForm({
  campaignId,
  arrecadado,
  onClose,
}: {
  campaignId: string;
  arrecadado: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(arrecadado);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Anexe o comprovante do repasse.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("valor", String(valor));
    formData.set("data", data);
    formData.set("comprovante", file);

    try {
      const res = await fetch(`/api/financeiro/${campaignId}`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Não foi possível confirmar o repasse.");
        return;
      }
      onClose();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,30,24,.55)] p-6">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px] rounded-2xl bg-white p-6">
        <h3 className="font-serif text-xl font-semibold">Confirmar repasse</h3>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="text-[12.5px] font-semibold text-muted">
            Valor repassado (R$)
            <input
              type="number"
              min={0.01}
              step="0.01"
              required
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Data do repasse
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Comprovante do repasse (obrigatório)
            <input
              type="file"
              required
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-lg border border-dashed border-border bg-bg px-3 py-2.5 text-[12.5px]"
            />
          </label>
          {error && <p className="text-[13px] text-urgent">{error}</p>}
          <div className="mt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[10px] border border-border bg-bg px-4.5 py-2.5 text-[13px] font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-[10px] bg-primary px-4.5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Confirmando…" : "Confirmar repasse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
