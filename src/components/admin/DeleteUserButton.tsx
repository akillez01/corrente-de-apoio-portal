"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteUserButton({
  uid,
  nome,
  disabled,
}: {
  uid: string;
  nome: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${uid}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Não foi possível excluir o usuário.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (disabled) {
    return null;
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted">Excluir {nome}?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-urgent px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Excluindo..." : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-lg border border-border px-2 py-1 text-[11px] text-muted"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-urgent/40 px-2.5 py-1.5 text-[12px] font-semibold text-urgent hover:bg-urgent/10"
      >
        Excluir
      </button>
      {error && <p className="mt-1 text-[11px] text-urgent">{error}</p>}
    </div>
  );
}
