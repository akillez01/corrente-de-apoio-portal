"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Campaign } from "@/lib/types/domain";

export function CampaignPublicationQueue({
  campaigns,
  userId,
}: {
  campaigns: Campaign[];
  userId: string;
}) {
  const router = useRouter();
  const [images, setImages] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  async function uploadImage(campaignId: string, file: File | undefined) {
    if (!file) return;
    setBusyId(campaignId);
    setErrors((previous) => ({ ...previous, [campaignId]: "" }));
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/site-media", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) {
        setErrors((previous) => ({ ...previous, [campaignId]: result.error ?? "Falha ao enviar imagem." }));
        return;
      }
      setImages((previous) => ({ ...previous, [campaignId]: result.url }));
    } catch {
      setErrors((previous) => ({ ...previous, [campaignId]: "Falha de conexão ao enviar a imagem." }));
    } finally {
      setBusyId(null);
    }
  }

  async function publish(campaign: Campaign) {
    setBusyId(campaign.id);
    setNotice(null);
    setErrors((previous) => ({ ...previous, [campaign.id]: "" }));
    try {
      const response = await fetch(`/api/admin/campanhas/${campaign.id}/publicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: images[campaign.id] ?? campaign.imageUrl ?? "" }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors((previous) => ({ ...previous, [campaign.id]: result.error ?? "Não foi possível publicar." }));
        return;
      }
      setNotice(`Campanha “${campaign.titulo}” publicada.`);
      router.refresh();
    } catch {
      setErrors((previous) => ({ ...previous, [campaign.id]: "Falha de conexão ao publicar." }));
    } finally {
      setBusyId(null);
    }
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-muted">
        Não há campanhas aprovadas aguardando publicação.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notice && <p role="status" className="rounded-xl bg-[#EDF6EF] p-3 text-sm text-primary">{notice}</p>}
      {campaigns.map((campaign) => {
        const mustUseAnotherPerson = campaign.aprovadoPorUid === userId;
        const imageUrl = images[campaign.id] ?? campaign.imageUrl ?? "";
        return (
          <article key={campaign.id} className="grid gap-5 rounded-2xl border border-border bg-white p-4 sm:p-5 lg:grid-cols-[1fr_260px]">
            <div>
              <div className="mb-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-[#EDF6EF] px-2.5 py-1 font-semibold text-primary">Aprovada pela curadoria</span>
                <span className="rounded-full bg-bg px-2.5 py-1 text-muted">{campaign.categoria}</span>
              </div>
              <h2 className="font-serif text-xl font-semibold">{campaign.titulo}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{campaign.textoPublico.join("\n\n")}</p>
              <p className="mt-3 text-xs text-muted">
                Aprovada por {campaign.aprovadoPor || "curadoria"} · Meta R$ {campaign.meta.toLocaleString("pt-BR")}
              </p>
              {mustUseAnotherPerson && (
                <p className="mt-3 rounded-lg border border-[#E7DDBF] bg-[#FFF9E9] p-3 text-xs text-[#685835]">
                  Para manter a separação de responsabilidades, outra conta deve publicar esta campanha.
                </p>
              )}
              {errors[campaign.id] && <p role="alert" className="mt-3 text-sm text-urgent">{errors[campaign.id]}</p>}
            </div>
            <div className="flex flex-col gap-3">
              {imageUrl && (
                <Image src={imageUrl} alt="" width={520} height={280} className="h-36 w-full rounded-xl border border-border object-cover" />
              )}
              <label className="block text-xs font-semibold text-muted">
                Imagem da campanha (opcional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={busyId === campaign.id}
                  onChange={(event) => {
                    void uploadImage(campaign.id, event.currentTarget.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                  className="mt-1 block w-full rounded-lg border border-border bg-white p-2 text-xs"
                />
              </label>
              <button
                type="button"
                onClick={() => void publish(campaign)}
                disabled={busyId === campaign.id || mustUseAnotherPerson}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyId === campaign.id ? "Processando…" : "Publicar campanha"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
