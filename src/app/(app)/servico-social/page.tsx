import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getRequestsForSocialWork } from "@/lib/data/requests";
import { getSocialCaseStatuses } from "@/lib/data/socialCases";
import { KpiCard } from "@/components/dashboard/KpiCard";

export const revalidate = 0;

const CASE_LABEL = {
  sem_ficha: { label: "Aguardando acolhimento", className: "bg-[#FDF3DC] text-[#8A6414]" },
  aberto: { label: "Em acompanhamento", className: "bg-[#E3EEFB] text-[#2B5AA0]" },
  encerrado: { label: "Encerrado", className: "bg-[#F0F0F0] text-[#555555]" },
} as const;

export default async function ServicoSocialPage() {
  await requireRole("assistente_social", "admin");
  const [requests, statuses] = await Promise.all([getRequestsForSocialWork(), getSocialCaseStatuses()]);
  const rows = requests.map((request) => ({
    request,
    caseStatus: (statuses.get(request.id) ?? "sem_ficha") as keyof typeof CASE_LABEL,
  }));
  const count = (status: keyof typeof CASE_LABEL) => rows.filter((row) => row.caseStatus === status).length;

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Serviço Social</h1>
      <p className="mb-5 text-[13px] text-muted">
        🔒 Área restrita às assistentes sociais. Dados sigilosos — use apenas para a intervenção social.
      </p>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Aguardando acolhimento" value={String(count("sem_ficha"))} />
        <KpiCard label="Em acompanhamento" value={String(count("aberto"))} />
        <KpiCard label="Encerrados" value={String(count("encerrado"))} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">
          Nenhum cadastro recebido ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {rows.map(({ request, caseStatus }) => (
            <Link
              key={request.id}
              href={`/servico-social/${request.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-primary"
            >
              <div className="min-w-0">
                <div className="font-semibold">
                  {request.identificacao?.nomeSocial || request.requerenteNome}
                  {request.urgente && (
                    <span className="ml-2 rounded-full bg-[#FDECE3] px-2 py-0.5 text-[11px] font-semibold text-urgent">
                      urgente
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {(request.categorias ?? [request.categoria]).join(", ")}
                  {request.identificacao?.municipio ? ` · ${request.identificacao.municipio}` : ""} · recebido em{" "}
                  {new Date(request.criadoEm).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${CASE_LABEL[caseStatus].className}`}>
                {CASE_LABEL[caseStatus].label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
