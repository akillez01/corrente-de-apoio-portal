import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";
import { getPublicPageCopy } from "@/lib/data/content";
import { getCampaignsForTransparency } from "@/lib/data/campaigns";
import { getTransferForCampaign } from "@/lib/data/transfers";
import { formatBRL } from "@/lib/format";

export const revalidate = 60;

const COLUMNS = {
  pt: { campaign: "Campanha", goal: "Meta", raised: "Arrecadado", transferred: "Repassado", date: "Data do repasse", pending: "Pendente" },
  en: { campaign: "Campaign", goal: "Goal", raised: "Raised", transferred: "Transferred", date: "Transfer date", pending: "Pending" },
} as const;

export default async function TransparenciaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const copy = await getPublicPageCopy("transparency", l);
  const c = COLUMNS[l] ?? COLUMNS.pt;
  const campaigns = await getCampaignsForTransparency();
  const rows = await Promise.all(
    campaigns.map(async (campaign) => ({ campaign, transfer: await getTransferForCampaign(campaign.id) })),
  );
  const totals = rows.reduce(
    (sum, { campaign, transfer }) => ({
      raised: sum.raised + campaign.arrecadado,
      transferred: sum.transferred + (transfer?.valor ?? 0),
    }),
    { raised: 0, transferred: 0 },
  );

  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1080px]">
        {copy.imageUrl && (
          <div className="relative mb-8 h-48 overflow-hidden rounded-3xl bg-[#EAE6D8] sm:h-72">
            <Image src={copy.imageUrl} alt={copy.imageAlt} fill sizes="(min-width: 1080px) 1080px, 100vw" className="object-cover" />
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{copy.eyebrow}</p>
        <h1 className="mt-3 font-serif text-[clamp(36px,6vw,64px)] font-medium leading-[1.02] tracking-[-.035em] text-[#16392D]">
          {copy.title}
        </h1>
        <p className="mt-5 max-w-[720px] text-base leading-7 text-[#4E6256] sm:text-lg">{copy.intro}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E2E7DE] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5C6F63]">{c.raised}</p>
            <p className="mt-2 font-mono text-2xl text-[#2A6249]">R$ {formatBRL(totals.raised)}</p>
          </div>
          <div className="rounded-2xl border border-[#E2E7DE] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5C6F63]">{c.transferred}</p>
            <p className="mt-2 font-mono text-2xl text-[#2A6249]">R$ {formatBRL(totals.transferred)}</p>
          </div>
        </div>

        <h2 className="mt-10 font-serif text-2xl font-medium text-[#1D4032]">{copy.tableTitle}</h2>
        {rows.length ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E2E7DE] bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#F2F5F0] text-xs uppercase tracking-wider text-[#5C6F63]">
                <tr>
                  <th className="px-4 py-3 font-semibold">{c.campaign}</th>
                  <th className="px-4 py-3 text-right font-semibold">{c.goal}</th>
                  <th className="px-4 py-3 text-right font-semibold">{c.raised}</th>
                  <th className="px-4 py-3 text-right font-semibold">{c.transferred}</th>
                  <th className="px-4 py-3 font-semibold">{c.date}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ campaign, transfer }) => (
                  <tr key={campaign.id} className="border-t border-[#EEF1EC]">
                    <td className="px-4 py-3">
                      <Link href={`/${l}/campanha/${campaign.slug}`} className="font-semibold text-[#2A6249] hover:underline">
                        {campaign.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">R$ {formatBRL(campaign.meta)}</td>
                    <td className="px-4 py-3 text-right font-mono">R$ {formatBRL(campaign.arrecadado)}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {transfer ? `R$ ${formatBRL(transfer.valor)}` : c.pending}
                    </td>
                    <td className="px-4 py-3">
                      {transfer ? new Date(transfer.data).toLocaleDateString(l === "en" ? "en-US" : "pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-[#CBD6CB] bg-white/70 px-6 py-10 text-center text-sm text-[#66756A]">
            {copy.emptyText}
          </p>
        )}

        {copy.note && (
          <p className="mt-7 rounded-xl border border-[#E7DDBF] bg-[#FFF9E9] px-5 py-4 text-sm leading-6 text-[#685835]">
            {copy.note}
          </p>
        )}
      </div>
    </main>
  );
}
