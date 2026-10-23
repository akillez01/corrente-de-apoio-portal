import { KpiCard } from "@/components/dashboard/KpiCard";
import { FriendlyStatusChip } from "@/components/pedidos/FriendlyStatusChip";
import { requireRole } from "@/lib/auth/session";
import { getCampaignByRequestId } from "@/lib/data/campaigns";
import { getRequestsByRequerente } from "@/lib/data/requests";
import { getSocialCase } from "@/lib/data/socialCases";
import { friendlyStatus } from "@/lib/domain/acompanhamento";
import Link from "next/link";

export const revalidate = 0;

export default async function MeusPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string; anexos?: string }>;
}) {
  const user = await requireRole("requerente", "admin");
  const { enviado, anexos } = await searchParams;
  const requests = await getRequestsByRequerente(user.uid);

  const items = await Promise.all(
    requests.map(async (request) => {
      const [socialCase, campaign] = await Promise.all([getSocialCase(request.id), getCampaignByRequestId(request.id)]);
      const status = friendlyStatus({
        status: request.status,
        criadoEm: request.criadoEm,
        encaminhamentoCampanha: request.encaminhamentoCampanha,
        caso: socialCase
          ? {
              status: socialCase.status,
              resultado: socialCase.encerramento?.resultado ?? null,
              encerradoEm: socialCase.encerramento?.data ?? null,
            }
          : null,
        campanha: campaign ? { status: campaign.status, slug: campaign.slug } : null,
      });
      const lastTeamMessage = [...request.mensagens]
        .filter((msg) => msg.origem !== "requerente")
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0];
      return { request, status, lastTeamMessage };
    }),
  );

  const aguardandoResposta = items.filter((item) => item.status.tone === "action").length;
  const emAndamento = items.filter((item) => item.status.tone === "progress" || item.status.tone === "neutral").length;
  const concluidos = items.filter((item) => item.status.tone === "done").length;

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
            " Seus anexos não puderam ser enviados agora, mas o cadastro foi salvo. Você pode enviá-los de novo abrindo o pedido."}
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Pedidos enviados" value={String(items.length)} />
        <KpiCard label="Em andamento" value={String(emAndamento)} />
        <KpiCard label="Aguardando sua resposta" value={String(aguardandoResposta)} />
        <KpiCard label="Concluídos" value={String(concluidos)} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">
          Você ainda não enviou nenhum pedido.{" "}
          <Link href="/meus-pedidos/novo" className="text-primary underline">
            Começar agora
          </Link>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(({ request, status, lastTeamMessage }) => (
            <Link
              key={request.id}
              href={`/meus-pedidos/${request.id}`}
              className="block rounded-2xl border border-border bg-white p-[18px] transition hover:border-primary"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold">
                    {(request.categorias ?? [request.categoria]).join(", ")}
                  </h3>
                  <div className="mt-0.5 text-xs text-muted">
                    Enviado em {new Date(request.criadoEm).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <FriendlyStatusChip label={status.label} tone={status.tone} />
              </div>
              {lastTeamMessage && (
                <p className="mt-3 line-clamp-2 rounded-lg bg-bg p-3 text-[12.5px]">
                  <span className="font-semibold">Última mensagem da equipe:</span> {lastTeamMessage.texto}
                </p>
              )}
              <span className="mt-3 inline-block text-[13px] font-semibold text-primary">Acompanhar pedido →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
