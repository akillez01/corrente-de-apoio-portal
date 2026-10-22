import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusChip } from "@/components/StatusChip";
import { requireRole } from "@/lib/auth/session";
import { getRequestsQueue } from "@/lib/data/requests";
import { formatBRL } from "@/lib/format";
import Link from "next/link";

export const revalidate = 0;

export default async function CuradoriaFilaPage({
  searchParams,
}: {
  searchParams: Promise<{ aprovado?: string }>;
}) {
  const user = await requireRole("curador", "admin");
  const { aprovado } = await searchParams;
  const requests = await getRequestsQueue();
  const urgentes = requests.filter((request) => request.urgente).length;
  const emAlinhamento = requests.filter((request) => request.status === "em_alinhamento").length;
  const metaFila = requests.reduce((acc, request) => acc + request.meta, 0);
  const pendentesIniciais = requests.filter(
    (request) => request.status === "submetido" || request.status === "em_analise",
  ).length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3.5">
        <h1 className="font-serif text-2xl font-semibold">Fila de triagem</h1>
        <span className="rounded-full border border-[#EBD9A8] bg-[#FDF3DC] px-2.5 py-1 text-[11.5px] font-semibold text-[#8A6414]">
          Sessão: {user.nome} · curadoria
        </span>
      </div>

      {aprovado && (
        <p role="status" className="mb-5 rounded-xl border border-[#CFE3D6] bg-[#EFF7F1] p-4 text-[13px] text-[#1F4E39]">
          Campanha aprovada. Ela ainda <b>não está no site</b>: o admin precisa publicá-la em
          “Publicar campanhas”.
        </p>
      )}

      <div className="mb-5 flex gap-2.5 rounded-xl border border-[#EBD9A8] bg-[#FDF3DC] p-4 text-[13px] text-[#6B4E10]">
        <span>⚠</span>
        <span>
          Laudos e documentos anexados aos pedidos são visíveis apenas nesta área, para
          curadoria e admin. Nada vai ao ar sem aprovação e sem revisão do texto público
          junto ao requerente.
        </span>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Fila ativa" value={String(requests.length)} />
        <KpiCard label="Pedidos urgentes" value={String(urgentes)} />
        <KpiCard label="Em alinhamento" value={String(emAlinhamento)} />
        <KpiCard
          label="Meta em analise"
          value={`R$ ${formatBRL(metaFila)}`}
          hint={`${pendentesIniciais} pedido(s) aguardando primeira conclusao`}
        />
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">
          Nenhum pedido na fila no momento.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="grid grid-cols-[2.2fr_.8fr_.9fr_.9fr_auto] gap-3 bg-bg px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span>Pedido</span>
            <span>Categoria</span>
            <span>Meta sugerida</span>
            <span>Estado</span>
            <span />
          </div>
          {requests.map((request) => (
            <div
              key={request.id}
              className="grid grid-cols-[2.2fr_.8fr_.9fr_.9fr_auto] items-center gap-3 border-b border-border px-4.5 py-3.5 text-[13.5px] last:border-b-0"
            >
              <div>
                <div className="font-semibold">{request.titulo}</div>
                <div className="text-xs text-muted">{request.requerenteNome}</div>
                {request.encaminhamentoCampanha && (
                  <span className="mt-1 inline-block rounded-full bg-[#E3EEFB] px-2 py-0.5 text-[11px] font-semibold text-[#2B5AA0]">
                    Encaminhado pelo Serviço Social
                  </span>
                )}
              </div>
              <div className="text-muted">{request.categoria}</div>
              <div className="font-mono text-[12.5px]">{request.meta > 0 ? `R$ ${formatBRL(request.meta)}` : "a definir"}</div>
              <div>
                <StatusChip status={request.status} />
              </div>
              <Link
                href={`/curadoria/${request.id}`}
                className="whitespace-nowrap rounded-lg border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-semibold transition hover:border-primary"
              >
                {request.status === "em_alinhamento" ? "Continuar" : "Analisar"}
              </Link>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3.5 text-[12.5px] text-muted">
        Fluxo: submetido → análise/alinhamento → aprovação da curadoria → publicação pelo admin
        em “Publicar campanhas”. Só campanhas publicadas aparecem no portal.
      </p>
    </div>
  );
}
