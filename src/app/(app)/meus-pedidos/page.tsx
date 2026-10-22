import { StatusChip } from "@/components/StatusChip";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { requireRole } from "@/lib/auth/session";
import { getCampaignByRequestId } from "@/lib/data/campaigns";
import { getRequestsByRequerente } from "@/lib/data/requests";
import { formatBRL } from "@/lib/format";
import Link from "next/link";

export const revalidate = 0;

const VISIBLE_CAMPAIGN_STATUSES = new Set([
  "publicado",
  "meta_atingida",
  "prazo_encerrado",
  "repasse_pendente",
  "repassado",
  "prestacao_publicada",
  "encerrado",
]);

export default async function MeusPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string; anexos?: string }>;
}) {
  const user = await requireRole("requerente", "admin");
  const { enviado, anexos } = await searchParams;
  const requests = await getRequestsByRequerente(user.uid);
  const totalMeta = requests.reduce((acc, request) => acc + request.meta, 0);
  const emAndamento = requests.filter((request) =>
    ["submetido", "em_analise", "em_alinhamento"].includes(request.status),
  ).length;
  const aprovados = requests.filter((request) => request.status === "aprovado").length;
  const reprovados = requests.filter((request) => request.status === "reprovado").length;
  const totalMensagens = requests.reduce((acc, request) => acc + request.mensagens.length, 0);

  const campaignsByRequest = new Map<string, { slug: string; public: boolean }>();
  for (const request of requests) {
    if (request.status === "aprovado") {
      const campaign = await getCampaignByRequestId(request.id);
      if (campaign) {
        campaignsByRequest.set(request.id, {
          slug: campaign.slug,
          public: VISIBLE_CAMPAIGN_STATUSES.has(campaign.status),
        });
      }
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
          + Novo cadastro
        </Link>
      </div>

      {enviado && (
        <p role="status" className="mb-5 rounded-xl border border-[#CFE3D6] bg-[#EFF7F1] p-4 text-[13px] text-[#1F4E39]">
          Cadastro recebido! O Serviço Social vai analisar seu caso e entrar em contato pela forma
          que você escolheu. Acompanhe o andamento por aqui.
          {anexos === "falha" &&
            " Seus anexos não puderam ser enviados agora, mas o cadastro foi salvo. Se forem importantes, a equipe vai pedir de novo no atendimento."}
        </p>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Pedidos enviados" value={String(requests.length)} />
        <KpiCard label="Em andamento" value={String(emAndamento)} />
        <KpiCard label="Aprovados para publicação" value={String(aprovados)} />
        <KpiCard label="Reprovados" value={String(reprovados)} />
        <KpiCard
          label="Meta total"
          value={`R$ ${formatBRL(totalMeta)}`}
          hint={`${totalMensagens} mensagem(ns) no historico`}
        />
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
            const campaign = campaignsByRequest.get(request.id);
            return (
              <div key={request.id} className="rounded-2xl border border-border bg-white p-[18px]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-semibold">{request.titulo}</h3>
                    <div className="mt-0.5 text-xs text-muted">
                      {(request.categorias ?? [request.categoria]).join(", ")}
                      {request.meta > 0 ? ` · meta R$ ${formatBRL(request.meta)}` : ""} · enviado em{" "}
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

                {request.status === "aprovado" && campaign && !campaign.public && (
                  <p className="mt-3 text-[12.5px] text-muted">
                    Seu pedido foi aprovado para publicação. A equipe editorial está preparando a versão pública.
                  </p>
                )}

                {campaign?.public && (
                  <Link
                    href={`/pt/campanha/${campaign.slug}`}
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
