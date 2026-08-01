import type { CampaignStatus } from "@/lib/types/domain";

const STATUS_STYLE: Record<
  CampaignStatus,
  { label: string; bg: string; fg: string; border: string }
> = {
  rascunho: { label: "Rascunho", bg: "#F0F0F0", fg: "#555555", border: "#DDDDDD" },
  submetido: { label: "Submetido", bg: "#F0F0F0", fg: "#555555", border: "#DDDDDD" },
  em_analise: { label: "Em análise", bg: "#FDF3DC", fg: "#8A6414", border: "#EBD9A8" },
  em_alinhamento: { label: "Em alinhamento", bg: "#E3EEFB", fg: "#2B5AA0", border: "#C4D9F2" },
  aprovado: { label: "Aprovado", bg: "#EDF6EF", fg: "#2F6B4F", border: "#CBE3D2" },
  publicado: { label: "Publicado", bg: "#EDF6EF", fg: "#2F6B4F", border: "#CBE3D2" },
  meta_atingida: { label: "Meta atingida", bg: "#FDF3DC", fg: "#8A6414", border: "#EBD9A8" },
  prazo_encerrado: { label: "Prazo encerrado", bg: "#F0F0F0", fg: "#555555", border: "#DDDDDD" },
  repasse_pendente: { label: "Repasse pendente", bg: "#FDECE3", fg: "#B0522D", border: "#F2CBB5" },
  repassado: { label: "Repassado", bg: "#EDF6EF", fg: "#2F6B4F", border: "#CBE3D2" },
  prestacao_publicada: { label: "Prestação publicada", bg: "#EDF6EF", fg: "#2F6B4F", border: "#CBE3D2" },
  encerrado: { label: "Encerrado", bg: "#F0F0F0", fg: "#555555", border: "#DDDDDD" },
  reprovado: { label: "Reprovado", bg: "#FDECE3", fg: "#B0522D", border: "#F2CBB5" },
  arquivado: { label: "Arquivado", bg: "#F0F0F0", fg: "#555555", border: "#DDDDDD" },
};

export function StatusChip({ status }: { status: CampaignStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-block rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold"
      style={{ background: s.bg, color: s.fg, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}
