import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getRequestById } from "@/lib/data/requests";
import { formatBRL } from "@/lib/format";
import { CuradoriaActions } from "@/components/curadoria/CuradoriaActions";

export const revalidate = 0;

export default async function CuradoriaPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("curador", "admin");
  const request = await getRequestById(id);
  if (!request) notFound();

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex-1">
          <h1 className="font-serif text-xl font-semibold">{request.titulo}</h1>
          <div className="mt-1 font-mono text-xs text-muted">
            {request.requerenteNome} · {request.meta > 0 ? `meta R$ ${formatBRL(request.meta)}` : "meta a definir"}
            {request.urgente ? " · urgente" : ""}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-[#F2CBB5] bg-[#FDECE3] p-3.5 text-[12.5px] text-urgent">
        🔒 Área privada · anexos sensíveis visíveis apenas para curadoria e admin.
        Consentimento LGPD registrado em {new Date(request.consentimentoLgpdEm).toLocaleString("pt-BR")}.
      </div>

      {request.identificacao && (
        <section className="mb-[18px] rounded-xl border border-border bg-white p-3.5 text-[12.5px]">
          <h4 className="mb-2 font-semibold">Identificação e contato</h4>
          <p>
            {request.identificacao.nome}
            {request.identificacao.nomeSocial
              ? ` · nome social: ${request.identificacao.nomeSocial}`
              : ""}
            {request.identificacao.idade !== null && request.identificacao.idade !== undefined
              ? ` · ${request.identificacao.idade} anos`
              : ""}
          </p>
          <p className="text-muted">
            {[request.identificacao.municipio, request.identificacao.territorio]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="text-muted">
            Contato preferencial ({request.identificacao.formaContato}):{" "}
            {request.identificacao.contato}
          </p>
        </section>
      )}

      {(request.formasOferta?.length ||
        request.querParticipar ||
        request.querConversarComServicoSocial) && (
        <section className="mb-[18px] rounded-xl border border-border bg-white p-3.5 text-[12.5px]">
          <h4 className="mb-2 font-semibold">Outras formas de participação</h4>
          {request.formasOferta && request.formasOferta.length > 0 && (
            <p>O que pode oferecer: {request.formasOferta.join(", ")}.</p>
          )}
          {request.querParticipar && <p>Também quer participar de projetos ou ações.</p>}
          {request.detalhesOferta && <p className="mt-1">{request.detalhesOferta}</p>}
          {request.querConversarComServicoSocial && (
            <p className="mt-2">
              Pediu para conversar com a equipe social sobre situação familiar ou
              socioeconômica.
            </p>
          )}
        </section>
      )}

      {request.categorias && request.categorias.length > 0 && (
        <section className="mb-[18px] rounded-xl border border-border bg-white p-3.5 text-[12.5px]">
          <h4 className="mb-2 font-semibold">Preciso de apoio em</h4>
          <div className="flex flex-wrap gap-1.5">
            {request.categorias.map((categoria) => (
              <span key={categoria} className="rounded-full bg-bg px-2.5 py-1">{categoria}</span>
            ))}
          </div>
        </section>
      )}

      <h4 className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
        Anexos do requerente
      </h4>
      <div className="mb-[18px] flex flex-wrap gap-2">
        {request.anexos.length === 0 ? (
          <span className="text-[12.5px] text-muted">Nenhum anexo enviado.</span>
        ) : (
          request.anexos.map((anexo) => (
            <a
              key={anexo.path}
              href={`/api/anexos/${request.id}/${anexo.path.split("/").pop()}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs transition hover:border-primary"
            >
              🔒 {anexo.nome}
            </a>
          ))
        )}
      </div>

      <h4 className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
        Texto enviado pelo requerente (nunca publicado)
      </h4>
      <div className="mb-[18px] rounded-xl border border-border bg-bg p-3.5 text-[13px] text-muted">
        {request.descricao}
      </div>

      {request.mensagens.length > 0 && (
        <div className="mb-[18px]">
          <h4 className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
            Histórico de contato
          </h4>
          <div className="flex flex-col gap-2">
            {request.mensagens.map((msg, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-3 text-[12.5px]">
                <span className="font-semibold">{msg.autor}</span>{" "}
                <span className="text-muted">
                  · {new Date(msg.criadoEm).toLocaleString("pt-BR")}
                </span>
                <p className="mt-1">{msg.texto}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <CuradoriaActions request={request} />
    </div>
  );
}
