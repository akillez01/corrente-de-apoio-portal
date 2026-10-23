import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getRequestById } from "@/lib/data/requests";
import { getSocialCase } from "@/lib/data/socialCases";
import { getCampaignByRequestId } from "@/lib/data/campaigns";
import { buildTimeline, friendlyStatus, type TrackingInput } from "@/lib/domain/acompanhamento";
import { Timeline } from "@/components/pedidos/Timeline";
import { ConversaPanel } from "@/components/pedidos/ConversaPanel";
import { EnviarDocumentos } from "@/components/pedidos/EnviarDocumentos";
import { CancelarPedido } from "@/components/pedidos/CancelarPedido";
import { FriendlyStatusChip } from "@/components/pedidos/FriendlyStatusChip";

export const revalidate = 0;

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="contents">
      <dt className="text-muted">{label}</dt>
      <dd className="whitespace-pre-line">{value}</dd>
    </div>
  );
}

// Acompanhamento do pedido pela própria pessoa. Mostra etapas, o que ela enviou e a conversa;
// o prontuário do Serviço Social (avaliação, plano, evolução) não aparece aqui.
export default async function MeuPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("requerente", "admin");
  const request = await getRequestById(id);
  if (!request || (request.requerenteId !== user.uid && user.role !== "admin")) notFound();

  const [socialCase, campaign] = await Promise.all([getSocialCase(id), getCampaignByRequestId(id)]);
  const tracking: TrackingInput = {
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
  };
  const status = friendlyStatus(tracking);
  const ident = request.identificacao;
  const family = request.composicaoFamiliar;
  const socio = request.situacaoSocioeconomica;
  const cancelled = request.status === "arquivado";
  const canCancel = ["submetido", "em_analise", "em_alinhamento"].includes(request.status);

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-5">
      <div>
        <Link href="/meus-pedidos" className="text-[13px] text-muted hover:text-ink">
          ← Meus pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold">
              {(request.categorias ?? [request.categoria]).join(", ")}
            </h1>
            <p className="mt-1 text-[13px] text-muted">Enviado em {new Date(request.criadoEm).toLocaleString("pt-BR")}</p>
          </div>
          <FriendlyStatusChip label={status.label} tone={status.tone} />
        </div>
      </div>

      {status.tone === "action" && (
        <p className="rounded-xl border border-[#EBD9A8] bg-[#FDF3DC] p-4 text-[13px] text-[#6B4E10]">
          A equipe precisa de uma resposta sua. Leia as mensagens abaixo e responda por aqui.
        </p>
      )}

      <section className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        <h2 className="mb-4 font-serif text-xl font-semibold">Andamento</h2>
        <Timeline steps={buildTimeline(tracking)} />
      </section>

      <ConversaPanel requestId={request.id} mensagens={request.mensagens} viewer="requerente" disabled={cancelled} />

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-serif text-xl font-semibold">Documentos</h2>
        {request.anexos.length === 0 ? (
          <p className="text-[13px] text-muted">Nenhum documento enviado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {request.anexos.map((anexo) => (
              <a
                key={anexo.path}
                href={`/api/anexos/${request.id}/${anexo.path.split("/").pop()}`}
                className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs transition hover:border-primary"
              >
                📎 {anexo.nome}
              </a>
            ))}
          </div>
        )}
        {!cancelled && <EnviarDocumentos requestId={request.id} />}
      </section>

      <details className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        <summary className="cursor-pointer font-serif text-xl font-semibold">O que você enviou no cadastro</summary>
        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-[220px_1fr]">
          <Row label="Nome" value={ident?.nome ?? request.requerenteNome} />
          <Row label="Nome social" value={ident?.nomeSocial} />
          <Row label="Município" value={[ident?.municipio, ident?.territorio].filter(Boolean).join(" · ")} />
          <Row label="Contato" value={ident ? `${ident.contato} (${ident.formaContato})` : null} />
          <Row label="Pessoas na casa" value={family?.integrantes} />
          <Row label="Dependentes" value={family?.dependentes} />
          <Row label="Faixa etária" value={family?.faixaEtaria} />
          <Row label="Composição do domicílio" value={family?.composicaoDomiciliar} />
          <Row label="Outras informações" value={family?.outrasInformacoes} />
          <Row label="Trabalho" value={socio?.situacaoTrabalho} />
          <Row label="Renda" value={socio?.renda} />
          <Row label="Fontes de renda" value={socio?.fontesRenda} />
          <Row label="Benefícios" value={socio?.beneficios} />
          <Row label="Despesas essenciais" value={socio?.despesasEssenciais} />
          <Row label="Alimentação" value={socio?.situacaoAlimentar} />
          <Row label="Moradia" value={socio?.situacaoHabitacional} />
          <Row label="Seu relato" value={request.descricao} />
        </dl>
        <p className="mt-3 text-[12px] text-muted">
          Algum dado mudou (telefone, endereço, situação da família)? Avise a equipe pela conversa acima.
        </p>
      </details>

      {canCancel && <CancelarPedido requestId={request.id} />}
    </div>
  );
}
