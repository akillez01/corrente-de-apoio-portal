import type { SupportRequest } from "@/lib/types/domain";

// Selo de prioridade: a avaliação do Serviço Social, ou a marcação da pessoa enquanto não avaliado.
export function PrioridadeBadge({ request }: { request: SupportRequest }) {
  const nivel = request.prioridadeSocial?.nivel;
  if (nivel === "urgente") {
    return <span className="ml-2 rounded-full bg-[#FDECE3] px-2 py-0.5 text-[11px] font-semibold text-urgent">urgente</span>;
  }
  if (nivel === "alta") {
    return <span className="ml-2 rounded-full bg-[#FDF3DC] px-2 py-0.5 text-[11px] font-semibold text-[#8A6414]">prioridade alta</span>;
  }
  if (nivel === "normal") return null;
  return (
    <span className="ml-2 rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[11px] font-semibold text-[#555555]">
      {request.urgente ? "urgente (informado) · a avaliar" : "prioridade a avaliar"}
    </span>
  );
}
