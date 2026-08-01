import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getRequestsByRequerente } from "@/lib/data/requests";
import { getCampaignByRequestId } from "@/lib/data/campaigns";
import { StatusChip } from "@/components/StatusChip";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

export default async function MeusPedidosPage() {
  const user = await requireRole("requerente", "admin");
  const requests = await getRequestsByRequerente(user.uid);
  const campaignsByRequest = new Map<string, string>();
  for (const request of requests) {
    if (request.status === "aprovado") {
      const campaign = await getCampaignByRequestId(request.id);
      if (campaign) campaignsByRequest.set(request.id, campaign.slug);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold">Meus pedidos</h1>
        <Link
          href="/meus-pedidos/novo"
          className="rounded-[10px] bg-primary px-4.5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          + Novo pedido
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">
          Você ainda não enviou nenhum pedido.{" "}
          <Link href="/meus-pedidos/novo" className="text-primary underline">
            Começar agora
          </Link>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => {
            const slug = campaignsByRequest.get(request.id);
            return (
              <div key={request.id} className="rounded-2xl border border-border bg-white p-[18px]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-semibold">{request.titulo}</h3>
                    <div className="mt-0.5 text-xs text-muted">
                      {request.categoria} · meta R$ {formatBRL(request.meta)} · enviado em{" "}
                      {new Date(request.criadoEm).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <StatusChip status={request.status} />
                </div>

                {request.motivoReprovacao && (
                  <p className="mt-3 rounded-lg border border-[#F2CBB5] bg-[#FDECE3] p-3 text-[12.5px] text-urgent">
                    {request.motivoReprovacao}
                  </p>
                )}

                {request.mensagens.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {request.mensagens.map((msg, i) => (
                      <div key={i} className="rounded-lg border border-border bg-bg p-3 text-[12.5px]">
                        <span className="font-semibold">{msg.autor}</span>{" "}
                        <span className="text-muted">
                          · {new Date(msg.criadoEm).toLocaleString("pt-BR")}
                        </span>
                        <p className="mt-1">{msg.texto}</p>
                      </div>
                    ))}
                  </div>
                )}

                {slug && (
                  <Link
                    href={`/pt/campanha/${slug}`}
                    className="mt-3 inline-block rounded-lg border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-semibold transition hover:border-primary"
                  >
                    Ver campanha publicada →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
