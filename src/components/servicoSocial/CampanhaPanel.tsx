"use client";

import type { CampaignReferral, CampaignStatus } from "@/lib/types/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PUBLIC_STATUSES: CampaignStatus[] = [
  "publicado",
  "meta_atingida",
  "prazo_encerrado",
  "repasse_pendente",
  "repassado",
  "prestacao_publicada",
  "encerrado",
];

export interface CampaignSummary {
  status: CampaignStatus;
  slug: string;
  titulo: string;
}

function stage(
  referral: CampaignReferral | null,
  requestStatus: string,
  campaign: CampaignSummary | null,
): { label: string; detail: string } {
  if (campaign && PUBLIC_STATUSES.includes(campaign.status)) {
    return { label: "Publicada no portal", detail: "A campanha está visível em Doar." };
  }
  if (campaign) {
    return {
      label: "Aprovada — aguardando publicação",
      detail: "A curadoria aprovou. Uma pessoa do conteúdo (diferente de quem aprovou) precisa publicar em “Publicar campanhas”.",
    };
  }
  if (requestStatus === "reprovado") {
    return { label: "Não aprovada pela curadoria", detail: "A curadoria decidiu não abrir campanha para este caso." };
  }
  if (requestStatus === "em_alinhamento") {
    return { label: "Em alinhamento na curadoria", detail: "A curadoria pediu ajustes ou informações antes de aprovar." };
  }
  return {
    label: "Na curadoria",
    detail: referral
      ? "Aguardando a curadoria definir título, meta e texto público."
      : "Ainda não encaminhado.",
  };
}

// Ponte entre o atendimento social e a campanha pública: o Serviço Social encaminha,
// a curadoria aprova e outra pessoa publica (separação de responsabilidades).
export function CampanhaPanel({
  requestId,
  requestStatus,
  referral,
  campaign,
  caseOpen,
}: {
  requestId: string;
  requestStatus: string;
  referral: CampaignReferral | null;
  campaign: CampaignSummary | null;
  caseOpen: boolean;
}) {
  const router = useRouter();
  const [justificativa, setJustificativa] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = stage(referral, requestStatus, campaign);
  const published = campaign && PUBLIC_STATUSES.includes(campaign.status);

  async function encaminhar(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/servico-social/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "encaminhar_campanha", texto: justificativa }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Não foi possível encaminhar.");
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
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5">
      <h2 className="font-serif text-xl font-semibold">Campanha pública</h2>

      {referral || campaign ? (
        <>
          <div className="rounded-lg border border-[#CFE3D6] bg-[#EFF7F1] p-3 text-[13px] text-[#1F4E39]">
            <b>{current.label}.</b> {current.detail}
            {published && campaign && (
              <>
                {" "}
                <Link href={`/pt/campanha/${campaign.slug}`} className="font-semibold underline">
                  Ver “{campaign.titulo}”
                </Link>
              </>
            )}
          </div>
          {referral && (
            <p className="text-[12px] text-muted">
              Encaminhado por {referral.por} em {new Date(referral.em).toLocaleString("pt-BR")}: {referral.justificativa}
            </p>
          )}
        </>
      ) : caseOpen ? (
        <form onSubmit={encaminhar} className="flex flex-col gap-2">
          <p className="text-[13px] text-muted">
            Se a situação pede uma campanha de arrecadação, encaminhe para a curadoria. Ela define
            título, meta e texto público; depois outra pessoa publica, e a campanha aparece em Doar.
            Nenhum dado do prontuário é enviado — só a justificativa abaixo.
          </p>
          <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-muted">
            Justificativa para a curadoria
            <textarea
              required
              maxLength={2000}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex.: família avaliada; necessidade de cesta básica por 3 meses, cerca de R$ 600."
              className="mt-1 min-h-[80px] w-full resize-y rounded-xl border border-border bg-white p-3 text-[13.5px] text-ink outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-fit rounded-[10px] bg-primary px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Encaminhando…" : "Encaminhar para campanha"}
          </button>
        </form>
      ) : (
        <p className="text-[13px] text-muted">
          Abra o atendimento (salve a ficha) para poder encaminhar este caso para uma campanha.
        </p>
      )}

      {error && <p role="alert" className="text-[13px] text-urgent">{error}</p>}
    </section>
  );
}
