"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ACTIONS = {
  pendente: [
    ["aprovar", "Aprovar e publicar", "bg-primary text-white"],
    ["reprovar", "Reprovar", "border border-[#F2CBB5] bg-white text-urgent"],
  ],
  aprovado: [["retirar", "Retirar do ar", "border border-border bg-bg text-ink"]],
  reprovado: [["aprovar", "Aprovar e publicar", "bg-primary text-white"]],
} as const;

export function ModerationActions({
  tipo,
  id,
  status,
}: {
  tipo: "projeto" | "ponto";
  id: string;
  status: keyof typeof ACTIONS;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/moderacao", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, id, action }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Não foi possível concluir.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ACTIONS[status].map(([action, label, className]) => (
        <button
          key={action}
          type="button"
          disabled={busy}
          onClick={() => run(action)}
          className={`rounded-[10px] px-3.5 py-2 text-[12.5px] font-semibold disabled:opacity-60 ${className}`}
        >
          {label}
        </button>
      ))}
      {error && <span role="alert" className="text-[12.5px] text-urgent">{error}</span>}
    </div>
  );
}
