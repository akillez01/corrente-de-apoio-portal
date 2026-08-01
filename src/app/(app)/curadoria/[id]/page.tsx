import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getRequestById } from "@/lib/data/requests";
import { formatBRL } from "@/lib/format";
import { CuradoriaActions } from "@/components/curadoria/CuradoriaActions";

export const revalidate = 0;

export default async function CuradoriaPedidoPage({ params }: { params: { id: string } }) {
  await requireRole("curador", "admin");
  const request = await getRequestById(params.id);
  if (!request) notFound();

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex-1">
          <h1 className="font-serif text-xl font-semibold">{request.titulo}</h1>
          <div className="mt-1 font-mono text-xs text-muted">
            {request.requerenteNome} · meta R$ {formatBRL(request.meta)}
            {request.urgente ? " · urgente" : ""}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-[#F2CBB5] bg-[#FDECE3] p-3.5 text-[12.5px] text-urgent">
        🔒 Área privada · anexos sensíveis visíveis apenas para curadoria e admin.
        Consentimento LGPD registrado em {new Date(request.consentimentoLgpdEm).toLocaleString("pt-BR")}.
      </div>

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
