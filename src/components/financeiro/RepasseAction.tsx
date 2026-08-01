"use client";

import { useState } from "react";
import { ConfirmarRepasseForm } from "./ConfirmarRepasseForm";

export function RepasseAction({
  campaignId,
  arrecadado,
  bloqueadoPorSegregacao,
}: {
  campaignId: string;
  arrecadado: number;
  bloqueadoPorSegregacao: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (bloqueadoPorSegregacao) {
    return (
      <span className="whitespace-nowrap text-[11.5px] text-muted" title="Segregação de função: você aprovou esta campanha e não pode confirmar o repasse.">
        Bloqueado (segregação)
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="whitespace-nowrap rounded-lg border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-semibold transition hover:border-primary"
      >
        Confirmar repasse
      </button>
      {open && (
        <ConfirmarRepasseForm
          campaignId={campaignId}
          arrecadado={arrecadado}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
