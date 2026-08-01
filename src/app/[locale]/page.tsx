import { getPublicCampaigns } from "@/lib/data/campaigns";
import { CampaignCard } from "@/components/CampaignCard";

export const revalidate = 60;

const WHY_DONATE = [
  {
    title: "Verificado",
    text: "Toda campanha passa pela equipe social da instituição antes de ir ao ar. Nada é publicado sem análise e contato direto com a família.",
  },
  {
    title: "Direto",
    text: "Sua doação vai para a conta institucional, sem intermediários. O progresso da campanha atualiza automaticamente a cada Pix recebido.",
  },
  {
    title: "Transparente",
    text: "Cada campanha encerra com prestação de contas pública: quanto entrou, quando foi repassado e o comprovante do repasse.",
  },
];

export default async function PortalPublicoPage() {
  const campaigns = await getPublicCampaigns();

  return (
    <main>
      <div className="relative overflow-hidden bg-gradient-to-b from-header to-[#234A39] px-6 pb-[110px] pt-[52px] text-white">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Irmandade que cuida
          </div>
          <h1 className="max-w-[660px] text-balance font-serif text-[clamp(30px,5vw,46px)] font-semibold leading-[1.14]">
            Quando um irmão precisa, a corrente inteira responde.
          </h1>
          <p className="mt-4 max-w-[540px] text-balance text-base opacity-85">
            Campanhas de apoio verificadas pela instituição, com doação direta por Pix ou
            PayPal e prestação de contas pública do primeiro ao último centavo.
          </p>
        </div>
      </div>

      <div className="relative z-[2] mx-auto -mt-16 max-w-[1080px] px-6 pb-[72px]">
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">
            Nenhuma campanha publicada no momento. Volte em breve.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}

        <div className="mb-[18px] mt-10 flex items-baseline gap-3">
          <h2 className="font-serif text-2xl font-semibold">Por que doar por aqui</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
          {WHY_DONATE.map((item) => (
            <div key={item.title} className="rounded-2xl bg-header p-[22px] text-white">
              <h4 className="mb-2 font-serif text-[17px] text-accent">{item.title}</h4>
              <p className="text-balance text-[12.5px] opacity-85">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
