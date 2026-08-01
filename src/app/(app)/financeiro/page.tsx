import { requireRole } from "@/lib/auth/session";
import { getCampaignsForFinance } from "@/lib/data/finance";
import { StatusChip } from "@/components/StatusChip";
import { RepasseAction } from "@/components/financeiro/RepasseAction";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

const PENDING_STATUSES = new Set(["meta_atingida", "prazo_encerrado", "repasse_pendente"]);

export default async function FinanceiroPage() {
  const user = await requireRole("financeiro", "admin");
  const campaigns = await getCampaignsForFinance();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3.5">
        <h1 className="font-serif text-2xl font-semibold">Repasses</h1>
        <span className="rounded-full border border-[#F2CBB5] bg-[#FDECE3] px-2.5 py-1 text-[11.5px] font-semibold text-urgent">
          Sessão: {user.nome} · financeiro
        </span>
      </div>

      <div className="mb-5 flex gap-2.5 rounded-xl border border-[#EBD9A8] bg-[#FDF3DC] p-4 text-[13px] text-[#6B4E10]">
        <span>⚠</span>
        <span>
          Por segregação de função, quem aprova a campanha não confirma o repasse. O
          comprovante anexado aqui é publicado automaticamente na prestação de contas.
        </span>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">
          Nenhuma campanha aguardando repasse no momento.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="grid grid-cols-[2.2fr_1fr_1fr_.9fr_auto] gap-3 bg-bg px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span>Campanha</span>
            <span>Arrecadado</span>
            <span>Atualizada em</span>
            <span>Repasse</span>
            <span />
          </div>
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="grid grid-cols-[2.2fr_1fr_1fr_.9fr_auto] items-center gap-3 border-b border-border px-4.5 py-3.5 text-[13.5px] last:border-b-0"
            >
              <div>
                <div className="font-semibold">{campaign.titulo}</div>
                <div className="text-xs text-muted">{campaign.categoria}</div>
              </div>
              <div className="font-mono text-[12.5px]">R$ {formatBRL(campaign.arrecadado)}</div>
              <div className="font-mono text-[12.5px] text-muted">
                {new Date(campaign.atualizadoEm).toLocaleDateString("pt-BR")}
              </div>
              <div>
                <StatusChip status={campaign.status} />
              </div>
              <div>
                {PENDING_STATUSES.has(campaign.status) ? (
                  <RepasseAction
                    campaignId={campaign.id}
                    arrecadado={campaign.arrecadado}
                    bloqueadoPorSegregacao={campaign.aprovadoPorUid === user.uid}
                  />
                ) : (
                  <span className="text-[11.5px] text-muted">Concluído</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
