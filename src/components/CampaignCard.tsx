import Link from "next/link";
import Image from "next/image";
import type { Campaign } from "@/lib/types/domain";
import type { Locale } from "@/lib/i18n/config";
import { ProgressBar } from "./ProgressBar";
import { formatBRL } from "@/lib/format";
import { categoryGradient } from "@/lib/domain/categoryGradient";

const TEXT = {
  pt: {
    doneBadge: "Concluída · Prestação publicada",
    urgentBadge: (categoria: string) => `Urgente · ${categoria}`,
    raised: "arrecadados",
    goal: "meta",
    seeReport: "Ver prestação de contas",
    seeCampaign: "Ver campanha e apoiar",
  },
  en: {
    doneBadge: "Completed · Report published",
    urgentBadge: (categoria: string) => `Urgent · ${categoria}`,
    raised: "raised",
    goal: "goal",
    seeReport: "See financial report",
    seeCampaign: "See campaign & support",
  },
} as const;

export function CampaignCard({ campaign, locale }: { campaign: Campaign; locale: Locale }) {
  const t = TEXT[locale] ?? TEXT.pt;
  const concluida = campaign.status === "prestacao_publicada";
  const pct = (campaign.arrecadado / campaign.meta) * 100;
  const gradient = categoryGradient(campaign.categoria);

  const badgeLabel = concluida
    ? t.doneBadge
    : campaign.urgente
      ? t.urgentBadge(campaign.categoria)
      : campaign.categoria;

  return (
    <Link
      href={`/${locale}/campanha/${campaign.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(27,58,45,0.04)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(27,58,45,0.14)]"
    >
      <div
        className="relative flex h-[152px] items-end overflow-hidden bg-cover bg-center p-3 text-white"
        style={{ background: campaign.imageUrl ? undefined : gradient }}
      >
        {campaign.imageUrl && (
          <>
            <Image src={campaign.imageUrl} alt="" fill sizes="(min-width: 1280px) 360px, 100vw" className="object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/5" />
          </>
        )}
        <span
          className="relative rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
          style={{ background: campaign.urgente && !concluida ? "#B0522D" : "rgba(0,0,0,.35)" }}
        >
          {badgeLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-[18px]">
        <h3 className="font-serif text-[19px] font-semibold leading-tight">{campaign.titulo}</h3>
        <p className="flex-1 text-[13.5px] text-muted text-pretty">{campaign.resumoPublico}</p>
        <div>
          <ProgressBar pct={pct} variant={concluida ? "concluida" : "andamento"} />
          <div className="mt-2 flex justify-between text-[12.5px]">
            <span>
              <b className="font-mono text-[13.5px] text-primary">R$ {formatBRL(campaign.arrecadado)}</b>{" "}
              {t.raised}
            </span>
            <span className="font-mono text-[12px] text-muted">
              {t.goal} R$ {formatBRL(campaign.meta)}
            </span>
          </div>
        </div>
        <span
          className={
            concluida
              ? "rounded-[10px] border border-border bg-bg px-5 py-2.5 text-center text-sm font-semibold text-ink transition group-hover:border-primary"
              : "rounded-[10px] bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition group-hover:bg-primary-dark"
          }
        >
          {concluida ? t.seeReport : t.seeCampaign}
        </span>
      </div>
    </Link>
  );
}
