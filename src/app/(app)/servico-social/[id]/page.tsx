import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getRequestById } from "@/lib/data/requests";
import { getSocialCase } from "@/lib/data/socialCases";
import { RESULTADO_LABEL, type ResultadoEncerramento } from "@/lib/domain/encerramento";
import { ProntuarioForm } from "@/components/servicoSocial/ProntuarioForm";
import { CampanhaPanel } from "@/components/servicoSocial/CampanhaPanel";
import { PrioridadePanel } from "@/components/servicoSocial/PrioridadePanel";
import { ConversaPanel } from "@/components/pedidos/ConversaPanel";
import { getCampaignByRequestId } from "@/lib/data/campaigns";

export const revalidate = 0;

const FAMILY_LABELS = {
  integrantes: "Integrantes do grupo familiar",
  faixaEtaria: "Faixa etária",
  dependentes: "Pessoas dependentes",
  composicaoDomiciliar: "Composição domiciliar",
  outrasInformacoes: "Outras informações",
} as const;

const SOCIO_LABELS = {
  situacaoTrabalho: "Situação de trabalho",
  renda: "Renda",
  fontesRenda: "Fontes de renda",
  beneficios: "Benefícios",
  despesasEssenciais: "Despesas essenciais",
  situacaoAlimentar: "Situação alimentar",
  situacaoHabitacional: "Situação habitacional",
} as const;

function Module({ title, rows }: { title: string; rows: Array<[string, string | null | undefined]> }) {
  const filled = rows.filter(([, value]) => value);
  return (
    <section className="rounded-xl border border-border bg-white p-4 text-[13px]">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {filled.length === 0 ? (
        <p className="text-muted">Não informado no cadastro.</p>
      ) : (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-[200px_1fr]">
          {filled.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd className="whitespace-pre-line">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default async function ServicoSocialCasoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("assistente_social", "admin");
  const [request, socialCase, campaign] = await Promise.all([
    getRequestById(id),
    getSocialCase(id),
    getCampaignByRequestId(id),
  ]);
  if (!request) notFound();
  const ident = request.identificacao;

  return (
    <div className="mx-auto max-w-[820px]">
      <Link href="/servico-social" className="text-[13px] text-muted hover:text-ink">
        ← Voltar para a lista
      </Link>
      <h1 className="mt-2 font-serif text-2xl font-semibold">
        {ident?.nomeSocial || request.requerenteNome}
      </h1>
      <p className="mb-4 mt-1 text-xs text-muted">
        Cadastro recebido em {new Date(request.criadoEm).toLocaleString("pt-BR")}
        {request.prioridadeSocial
          ? ` · prioridade ${request.prioridadeSocial.nivel}`
          : request.urgente
            ? " · marcado como urgente pela pessoa"
            : ""}
        {" · "}consentimento LGPD em {new Date(request.consentimentoLgpdEm).toLocaleString("pt-BR")}
      </p>

      {request.status === "arquivado" && (
        <p className="mb-[18px] rounded-xl border border-border bg-[#F0F0F0] p-3.5 text-[12.5px] text-[#555555]">
          A pessoa cancelou este pedido. Veja o motivo nas mensagens.
        </p>
      )}

      {socialCase?.status === "encerrado" && socialCase.encerramento && (
        <section className="mb-[18px] rounded-xl border border-[#CFE3D6] bg-[#EFF7F1] p-4 text-[13px] text-[#1F4E39]">
          <h2 className="font-semibold">
            Atendimento encerrado ·{" "}
            {RESULTADO_LABEL[socialCase.encerramento.resultado as ResultadoEncerramento] ?? "resultado não informado"}
          </h2>
          <p className="mt-1 whitespace-pre-line">{socialCase.encerramento.texto}</p>
          <p className="mt-1 text-[11.5px] opacity-80">
            {socialCase.encerramento.autor} · {new Date(socialCase.encerramento.data).toLocaleString("pt-BR")}
            {" "}· veja abaixo a ficha e toda a evolução do caso.
          </p>
        </section>
      )}

      {request.anexosNaoSalvos && request.anexosNaoSalvos.length > 0 && (
        <p className="mb-[18px] rounded-xl border border-[#EBD9A8] bg-[#FDF3DC] p-3.5 text-[12.5px] text-[#8A6414]">
          A pessoa tentou enviar anexos que não puderam ser salvos ({request.anexosNaoSalvos.join(", ")}).
          Peça os arquivos novamente no atendimento.
        </p>
      )}

      <div className="mb-6 flex flex-col gap-3">
        <Module
          title="Módulo 1 — Identificação"
          rows={[
            ["Nome", ident?.nome ?? request.requerenteNome],
            ["Nome social", ident?.nomeSocial],
            ["Data de nascimento", ident?.dataNascimento ? new Date(`${ident.dataNascimento}T00:00:00`).toLocaleDateString("pt-BR") : null],
            ["Idade", ident?.idade != null ? `${ident.idade} anos` : null],
            ["Município", ident?.municipio],
            ["Território", ident?.territorio],
            ["E-mail", ident?.email],
            ["Contato", ident?.contato],
            ["Forma preferencial", ident?.formaContato],
          ]}
        />
        <Module
          title="Módulo 2 — Composição familiar"
          rows={Object.entries(FAMILY_LABELS).map(([key, label]) => [
            label,
            request.composicaoFamiliar?.[key as keyof typeof FAMILY_LABELS],
          ])}
        />
        <Module
          title="Módulo 3 — Situação socioeconômica"
          rows={Object.entries(SOCIO_LABELS).map(([key, label]) => [
            label,
            request.situacaoSocioeconomica?.[key as keyof typeof SOCIO_LABELS],
          ])}
        />
        <Module
          title="Módulo 4 — Preciso de apoio"
          rows={[
            ["Categorias", (request.categorias ?? [request.categoria]).join(", ")],
            ["Relato", request.descricao],
          ]}
        />
        {request.anexos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {request.anexos.map((anexo) => (
              <a
                key={anexo.path}
                href={`/api/anexos/${request.id}/${anexo.path.split("/").pop()}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs transition hover:border-primary"
              >
                🔒 {anexo.nome}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5">
        <PrioridadePanel
          requestId={request.id}
          prioridade={request.prioridadeSocial ?? null}
          urgenteInformado={request.urgenteInformadoPeloRequerente ?? request.urgente}
        />
      </div>

      <div className="mb-5">
        <CampanhaPanel
          requestId={request.id}
          requestStatus={request.status}
          referral={request.encaminhamentoCampanha ?? null}
          campaign={campaign ? { status: campaign.status, slug: campaign.slug, titulo: campaign.titulo } : null}
          caseOpen={socialCase?.status === "aberto"}
        />
      </div>

      <div className="mb-5">
        <ConversaPanel requestId={request.id} mensagens={request.mensagens} viewer="equipe" />
      </div>

      <ProntuarioForm
        key={socialCase?.atualizadoEm ?? "novo"}
        requestId={request.id}
        socialCase={socialCase}
        initialDemanda={(request.categorias ?? [request.categoria]).join(", ")}
      />
    </div>
  );
}
