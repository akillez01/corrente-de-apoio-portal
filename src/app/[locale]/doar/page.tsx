import { CampaignCard } from "@/components/CampaignCard";
import { getPublicCampaigns } from "@/lib/data/campaigns";
import { getPublicPageCopy } from "@/lib/data/content";
import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export default async function DoarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const copy = await getPublicPageCopy("campaigns", l);
  const campaigns = await getPublicCampaigns();

  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1080px]">
        {copy.imageUrl && (
          <div className="relative mb-8 h-48 overflow-hidden rounded-3xl sm:h-72">
            <Image src={copy.imageUrl} alt={copy.imageAlt} fill sizes="(min-width: 1080px) 1080px, 100vw" className="object-cover" />
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{copy.eyebrow}</p>
        <h1 className="mt-3 font-serif text-[clamp(36px,6vw,64px)] font-medium leading-[1.02] tracking-[-.035em] text-[#16392D]">
          {copy.title}
        </h1>
        <p className="mt-5 max-w-[720px] text-base leading-7 text-[#4E6256] sm:text-lg">
          {copy.intro}
        </p>

        {campaigns.length ? (
          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} locale={l} />
            ))}
          </div>
        ) : (
          <div className="mt-9 rounded-3xl border border-dashed border-[#CBD6CB] bg-white/70 px-6 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E2EEE5] font-serif text-2xl text-[#2A6249]">
              ✳
            </span>
            <h2 className="mt-4 font-serif text-2xl">{copy.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-[510px] text-sm leading-6 text-[#66756A]">
              {copy.emptyText}
            </p>
            <Link
              href={`/${l}/voluntariar`}
              className="mt-5 inline-flex rounded-full bg-[#2A6249] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1F4E39]"
            >
              {copy.ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
