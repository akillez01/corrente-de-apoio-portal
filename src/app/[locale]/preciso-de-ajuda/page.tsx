import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import { getPublicPageCopy } from "@/lib/data/content";
import { AcolhimentoForm } from "@/components/pedidos/AcolhimentoForm";

export const revalidate = 60;

export default async function PrecisoDeAjudaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const copy = await getPublicPageCopy("support", l);

  return (
    <main className="min-h-[65vh] bg-[#F8F7F1] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[760px]">
        {copy.imageUrl && (
          <div className="relative mb-8 h-48 overflow-hidden rounded-3xl bg-[#EAE6D8] sm:h-64">
            <Image src={copy.imageUrl} alt={copy.imageAlt} fill sizes="(min-width: 760px) 760px, 100vw" className="object-cover" />
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#96743B]">{copy.eyebrow}</p>
        <h1 className="mt-3 font-serif text-[clamp(36px,6vw,60px)] font-medium uppercase leading-[1.02] tracking-[-.02em] text-[#16392D]">
          {copy.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4E6256] sm:text-lg">{copy.intro}</p>

        <div className="mt-8">
          <AcolhimentoForm requireAccount loginHref={`/login?next=${encodeURIComponent(`/${l}/preciso-de-ajuda`)}`} />
        </div>

        {copy.note && (
          <p className="mt-7 rounded-xl border border-[#E7DDBF] bg-[#FFF9E9] px-5 py-4 text-sm leading-6 text-[#685835]">
            {copy.note}
          </p>
        )}
      </div>
    </main>
  );
}
