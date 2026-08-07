import { KpiCard } from "@/components/dashboard/KpiCard";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import Link from "next/link";

type InteractionDoc = {
  eventType?: "message" | "cta_click";
  message?: string;
  intent?: string;
  understood?: boolean;
  replyHasCtas?: boolean;
  ctasCount?: number;
  interactionId?: string;
  ctaLabel?: string;
  ctaHref?: string;
  createdAt?: string;
};

const STOP_WORDS = new Set([
  "a",
  "ao",
  "aos",
  "as",
  "com",
  "como",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "eu",
  "me",
  "minha",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "para",
  "por",
  "preciso",
  "quero",
  "um",
  "uma",
  "ser",
  "ter",
  "rede",
  "sol",
]);

type Period = "1d" | "7d" | "30d" | "all";

function parsePeriod(value: string | undefined): Period {
  if (value === "1d" || value === "7d" || value === "30d") return value;
  return "all";
}

function periodStart(period: Period): Date | null {
  if (period === "all") return null;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (period === "1d") return new Date(now - day);
  if (period === "7d") return new Date(now - 7 * day);
  return new Date(now - 30 * day);
}

function periodLabel(period: Period) {
  if (period === "1d") return "Hoje (24h)";
  if (period === "7d") return "Ultimos 7 dias";
  if (period === "30d") return "Ultimos 30 dias";
  return "Todo periodo";
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pct(numerator: number, denominator: number) {
  if (!denominator) return "0.0";
  return ((numerator / denominator) * 100).toFixed(1);
}

export const revalidate = 0;

export default async function AdminAtendimentosAssistentePage({
  searchParams,
}: {
  searchParams?: { period?: string };
}) {
  await requireRole("admin");

  const period = parsePeriod(searchParams?.period);
  const start = periodStart(period);

  const snapshot = await getAdminDb().collection("assistant_interactions").get();
  const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as InteractionDoc & { id: string });

  const scopedDocs = docs.filter((doc) => {
    if (!start) return true;
    if (!doc.createdAt) return false;
    const createdAt = new Date(doc.createdAt);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= start;
  });

  const messageEvents = scopedDocs.filter((doc) => (doc.eventType ?? "message") === "message");
  const clickEvents = scopedDocs.filter((doc) => doc.eventType === "cta_click");

  const intentCount = new Map<string, number>();
  for (const doc of messageEvents) {
    const intent = doc.intent ?? "geral";
    intentCount.set(intent, (intentCount.get(intent) ?? 0) + 1);
  }

  const ranking = Array.from(intentCount.entries()).sort((a, b) => b[1] - a[1]);

  const unclearMessages = messageEvents
    .filter((doc) => (doc.intent ?? "geral") === "geral")
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  const ctaEligibleMessages = messageEvents.filter((doc) => (doc.replyHasCtas ?? (doc.ctasCount ?? 0) > 0));
  const ctrOverall = pct(clickEvents.length, ctaEligibleMessages.length);

  const clicksByIntent = new Map<string, number>();
  for (const click of clickEvents) {
    const intent = click.intent ?? "geral";
    clicksByIntent.set(intent, (clicksByIntent.get(intent) ?? 0) + 1);
  }

  const intentCtrRows = ranking.map(([intent, total]) => {
    const clicks = clicksByIntent.get(intent) ?? 0;
    return { intent, total, clicks, ctr: pct(clicks, total) };
  });

  const unclearTokenCount = new Map<string, number>();
  for (const item of unclearMessages) {
    const text = normalize(item.message ?? "");
    for (const token of text.split(" ")) {
      if (token.length < 4 || STOP_WORDS.has(token)) continue;
      unclearTokenCount.set(token, (unclearTokenCount.get(token) ?? 0) + 1);
    }
  }

  const topUnclearTopics = Array.from(unclearTokenCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([token, count]) => `${token} (${count})`);

  const topIntent = ranking[0]?.[0] ?? null;
  const suggestions: string[] = [];

  if (topIntent === "pedido") {
    suggestions.push("Criar respostas mais detalhadas para triagem inicial de pedidos urgentes e documentacao necessaria.");
  }
  if (topIntent === "doacao") {
    suggestions.push("Adicionar CTA direto para campanhas com status publicado e copy de doacao recorrente.");
  }
  if (topIntent === "voluntariado") {
    suggestions.push("Incluir atalho para FAQ de voluntariado com tempo de retorno e etapas de aprovacao.");
  }
  if (unclearMessages.length > 0) {
    suggestions.push("Criar intents novas para mensagens sem entendimento claro e revisar frases de atalho no widget.");
  }
  if (topUnclearTopics.length > 0) {
    suggestions.push(`Priorizar conteudo para temas pouco compreendidos: ${topUnclearTopics.join(", ")}.`);
  }
  if (suggestions.length === 0) {
    suggestions.push("Manter monitoramento semanal e ajustar CTAs conforme comportamento de clique.");
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Atendimentos do assistente virtual</h1>
      <p className="mb-5 text-[13px] text-muted">
        Painel de demanda real dos visitantes, com foco em intencoes frequentes, mensagens sem
        entendimento e desempenho de CTA.
      </p>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {([
            { value: "1d", label: "24h" },
            { value: "7d", label: "7 dias" },
            { value: "30d", label: "30 dias" },
            { value: "all", label: "Total" },
          ] as const).map((item) => (
            <Link
              key={item.value}
              href={item.value === "all" ? "/admin/atendimentos" : `/admin/atendimentos?period=${item.value}`}
              className={
                period === item.value
                  ? "rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white"
                  : "rounded-lg border border-border bg-bg px-3 py-1.5 text-[12px] font-semibold text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] text-muted">Escopo: {periodLabel(period)}</span>
          <a
            href={
              period === "all"
                ? "/api/admin/atendimentos/export"
                : `/api/admin/atendimentos/export?period=${period}`
            }
            className="rounded-lg border border-[#2A5D48]/25 bg-[#F3F8F5] px-3 py-1.5 text-[12px] font-semibold text-[#1E4B39] transition hover:border-[#2A5D48]"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Interacoes (mensagens)" value={String(messageEvents.length)} />
        <KpiCard label="Cliques em CTA" value={String(clickEvents.length)} />
        <KpiCard label="Taxa de clique" value={`${ctrOverall}%`} />
        <KpiCard label="Sem entendimento" value={String(unclearMessages.length)} />
      </div>

      <div className="mb-5 rounded-2xl border border-border bg-white p-4">
        <h2 className="mb-3 font-serif text-lg font-semibold">Ranking de intencoes mais frequentes</h2>
        {ranking.length === 0 ? (
          <p className="text-[13px] text-muted">Ainda nao ha interacoes registradas.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[1.2fr_.7fr_.7fr_.6fr] gap-2 bg-bg px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <span>Intencao</span>
              <span>Mensagens</span>
              <span>Cliques</span>
              <span>CTR</span>
            </div>
            {intentCtrRows.map((row) => (
              <div
                key={row.intent}
                className="grid grid-cols-[1.2fr_.7fr_.7fr_.6fr] gap-2 border-t border-border px-4 py-2.5 text-[13px]"
              >
                <span className="font-semibold">{row.intent}</span>
                <span>{row.total}</span>
                <span>{row.clicks}</span>
                <span>{row.ctr}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="mb-3 font-serif text-lg font-semibold">Mensagens sem entendimento claro</h2>
          {unclearMessages.length === 0 ? (
            <p className="text-[13px] text-muted">Nenhuma mensagem sem entendimento no momento.</p>
          ) : (
            <div className="flex max-h-[380px] flex-col gap-2 overflow-auto">
              {unclearMessages.slice(0, 12).map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-bg p-3 text-[13px]">
                  <div className="font-medium">{item.message || "(sem texto)"}</div>
                  <div className="mt-1 text-[11.5px] text-muted">
                    {(item.createdAt && new Date(item.createdAt).toLocaleString("pt-BR")) || "sem data"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="mb-3 font-serif text-lg font-semibold">Melhorias sugeridas por demanda real</h2>
          <ul className="list-disc space-y-2 pl-5 text-[13px] text-[#355246]">
            {suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg border border-[#E8D7B2] bg-[#FFF7E7] p-3 text-[12.5px] text-[#6A5525]">
            Topicos pouco compreendidos: {topUnclearTopics.length ? topUnclearTopics.join(", ") : "nenhum identificado"}.
          </div>
        </div>
      </div>
    </div>
  );
}
