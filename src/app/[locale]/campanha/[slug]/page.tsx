import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/lib/data/campaigns";
import { getRecentDonations } from "@/lib/data/donations";
import { getTransferForCampaign } from "@/lib/data/transfers";
import { getPublicPageCopy } from "@/lib/data/content";
import { buildTrail } from "@/lib/domain/transparencyTrail";
import { categoryGradient } from "@/lib/domain/categoryGradient";
import { formatBRL } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { ProgressBar } from "@/components/ProgressBar";
import { TransparencyTrail } from "@/components/TransparencyTrail";
import { DonationPanel } from "@/components/DonationPanel";
import Image from "next/image";

export const revalidate = 0;

export default async function CampanhaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  const t = await getPublicPageCopy("campaign-detail", locale);
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) notFound();

  const [donations, transfer] = await Promise.all([
    getRecentDonations(campaign.id),
    getTransferForCampaign(campaign.id),
  ]);

  const pct = Math.min(100, (campaign.arrecadado / campaign.meta) * 100);
  const trail = buildTrail(campaign.status);
  const verificadoData = new Date(campaign.verificadoEm).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR");

  return (
    <main>
      <div
        className="relative flex h-[224px] items-end overflow-hidden bg-cover bg-center p-6 text-white sm:p-[26px]"
        style={{ background: campaign.imageUrl ? undefined : categoryGradient(campaign.categoria) }}
      >
        {campaign.imageUrl && (
          <>
            <Image src={campaign.imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          </>
        )}
        <div className="mx-auto w-full max-w-[1080px]">
          <span
            className="relative rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: campaign.urgente ? "#B0522D" : "rgba(0,0,0,.35)" }}
          >
            {campaign.urgente ? `${t.urgentPrefix} · ${campaign.categoria}` : campaign.categoria}
          </span>
          <h1 className="relative mt-3 text-balance font-serif text-[clamp(22px,3.5vw,32px)] font-semibold [text-shadow:0_2px_14px_rgba(0,0,0,.35)]">
            {campaign.titulo}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-6 py-7">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="mb-[18px] inline-flex items-center gap-1.5 rounded-lg border border-[#CBE3D2] bg-[#EDF6EF] px-3.5 py-1.5 text-[12.5px] font-semibold text-primary">
              ✔ {t.verifiedBy} {verificadoData}
            </div>

            {campaign.textoPublico.map((paragrafo, i) => (
              <p key={i} className="mb-3.5 text-balance text-[14.5px] text-[#33403A]">
                {paragrafo}
              </p>
            ))}

            <h3 className="mb-4 mt-6 font-serif text-lg font-semibold">{t.transparencyLine}</h3>
            <TransparencyTrail steps={trail} />

            {transfer && (
              <div className="mt-8 rounded-xl border border-border bg-white p-5">
                <h3 className="mb-3 font-serif text-lg font-semibold">{t.report}</h3>
                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-border bg-bg p-3.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {t.raised}
                    </div>
                    <div className="mt-1 font-mono text-lg text-primary">
                      R$ {formatBRL(campaign.arrecadado)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-bg p-3.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {t.transferred}
                    </div>
                    <div className="mt-1 font-mono text-lg text-primary">
                      R$ {formatBRL(transfer.valor)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-[13px]">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted">{t.transferToBeneficiary}</span>
                    <span className="font-mono">
                      {new Date(transfer.data).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">{t.confirmedBy}</span>
                    <span>{transfer.confirmadoPor}</span>
                  </div>
                </div>
                {transfer.comprovanteUrl && (
                  <a
                    href={`/api/comprovantes/${campaign.id}/${transfer.comprovanteUrl.split("/").pop()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block rounded-lg border border-border bg-bg px-3.5 py-2 text-[12.5px] font-semibold transition hover:border-primary"
                  >
                    {t.seeProof}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-bg p-[18px]">
              <ProgressBar pct={pct} variant={campaign.status === "prestacao_publicada" ? "concluida" : "andamento"} />
              <div className="mt-3 flex justify-between text-[12.5px]">
                <span>
                  <b className="font-mono text-xl text-primary">R$ {formatBRL(campaign.arrecadado)}</b>
                  <br />
                  <span className="text-xs text-muted">
                    {t.of} R$ {formatBRL(campaign.meta)}
                  </span>
                </span>
                <span className="text-right font-mono text-xs text-muted">
                  {campaign.doacoesCount} {t.donationsCountSuffix}
                </span>
              </div>
            </div>

            <DonationPanel campaignId={campaign.id} locale={locale} />

            <div className="rounded-xl border border-border bg-bg p-[18px]">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                {t.recentSupport}
              </h4>
              <div className="flex flex-col gap-2">
                {donations.length === 0 ? (
                  <p className="text-[12.5px] text-muted">{t.noDonationsYet}</p>
                ) : (
                  donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex justify-between rounded-lg border border-border bg-white px-2.5 py-2 text-[12.5px]"
                    >
                      <span className="text-muted">{donation.nome ?? t.anonymousSupporter}</span>
                      <span className="font-mono font-semibold text-primary">
                        R$ {formatBRL(donation.valor)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
