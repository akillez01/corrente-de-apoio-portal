import { CampaignCard } from "@/components/CampaignCard";
import { getPublicCampaigns } from "@/lib/data/campaigns";
import Link from "next/link";

export const revalidate = 60;

const ACTION_FRONTS = [
  {
    title: "Apoio a Saude",
    text: "Auxilio para medicamentos, consultas, exames e cirurgias, com foco em emergencias.",
    icon: "https://optim.tildacdn.one/tild6365-6362-4838-b461-363561346266/-/resize/200x/-/format/webp/icone_saude.png.webp",
  },
  {
    title: "Apoio Logistico",
    text: "Suporte para deslocamento fluvial, hospedagem e alimentacao de quem precisa ir ate a cidade.",
    icon: "https://optim.tildacdn.one/tild3936-6564-4730-a636-646430326239/-/resize/200x/-/format/webp/icone_logistico.png.webp",
  },
  {
    title: "Promocao Social",
    text: "Desenvolvimento comunitario, acesso a documentos e beneficios, alem de melhorias de infraestrutura.",
    icon: "https://optim.tildacdn.one/tild3934-6634-4962-b662-323766316237/-/resize/200x/-/format/webp/icone_social.png.webp",
  },
  {
    title: "Voluntariado",
    text: "Participe em acoes especificas com suas aptidoes e fortaleça a rede de apoio no territorio.",
    icon: "https://optim.tildacdn.one/tild6230-6664-4363-a164-653434656464/-/resize/200x/-/format/webp/icone_voluntariado.png.webp",
  },
];

const NEWS = [
  {
    title: "Fazenda Sao Sebastiao passa a ter acesso a internet",
    date: "09.11.2023",
    href: "noticias/fazenda-sao-sebastiao-internet",
  },
];

const FIELD_GALLERY = [
  "https://optim.tildacdn.one/tild3435-3434-4262-b736-636262653030/-/resize/600x600/-/format/webp/Pgina-1.png.webp",
  "https://optim.tildacdn.one/tild3461-3739-4161-a561-336437656338/-/resize/600x600/-/format/webp/Pgina-2.png.webp",
  "https://optim.tildacdn.one/tild3966-6436-4531-a133-333664636262/-/resize/600x600/-/format/webp/Pgina-3.png.webp",
  "https://optim.tildacdn.one/tild3561-3834-4337-a364-346336653930/-/resize/600x600/-/format/webp/Pgina-4.png.webp",
  "https://optim.tildacdn.one/tild3162-3666-4737-b438-623133333139/-/resize/600x600/-/format/webp/Pgina-5.png.webp",
  "https://optim.tildacdn.one/tild6437-3535-4535-b636-663862303263/-/resize/600x600/-/format/webp/Pgina-6.png.webp",
  "https://optim.tildacdn.one/tild3734-3232-4037-b637-343461303438/-/resize/600x600/-/format/webp/Pgina-7.png.webp",
  "https://optim.tildacdn.one/tild3136-3430-4836-b439-383631386365/-/resize/600x600/-/format/webp/Pgina-8.png.webp",
  "https://optim.tildacdn.one/tild3163-3462-4364-a134-613832626139/-/resize/600x600/-/format/webp/Pgina-9.png.webp",
  "https://optim.tildacdn.one/tild3838-6461-4261-b332-393764636463/-/resize/600x600/-/format/webp/Pgina-10.png.webp",
  "https://optim.tildacdn.one/tild3530-3563-4236-b166-343831616161/-/resize/600x600/-/format/webp/Pgina-11.png.webp",
  "https://optim.tildacdn.one/tild6162-3165-4463-b666-366362336637/-/resize/600x600/-/format/webp/Pgina-12.png.webp",
  "https://optim.tildacdn.one/tild3139-6237-4663-b033-663337313661/-/resize/600x600/-/format/webp/Pgina-13.png.webp",
  "https://optim.tildacdn.one/tild3737-6230-4133-a138-613533663034/-/resize/600x600/-/format/webp/Pgina-14.png.webp",
  "https://optim.tildacdn.one/tild3737-3430-4035-b866-626165353039/-/resize/600x600/-/format/webp/Pgina-15.png.webp",
  "https://optim.tildacdn.one/tild3261-3936-4035-b031-356133636261/-/resize/600x600/-/format/webp/Pgina-16.png.webp",
];

const WHY_DONATE = [
  {
    title: "Doacao recorrente",
    text: "Transforme apoio pontual em continuidade: contribua mensalmente para manter atendimento de campo e operacao do sistema.",
  },
  {
    title: "Parcerias locais",
    text: "Empresas e comunidades parceiras podem custear rotas fluviais, conectividade e insumos de campanhas especificas.",
  },
  {
    title: "Transparencia real",
    text: "Prestacao de contas publica, trilha de auditoria e metas por frente de acao para aumentar confianca de doadores.",
  },
];

export default async function PortalPublicoPage() {
  const campaigns = await getPublicCampaigns();

  return (
    <main className="bg-[radial-gradient(1300px_700px_at_15%_-5%,#FFEBB5_0%,#F6E3B0_30%,#F2F5F0_70%)]">
      <section className="relative overflow-hidden px-6 pb-20 pt-12 text-[#113125]">
        <div className="pointer-events-none absolute -right-16 top-12 h-56 w-56 rounded-full bg-[radial-gradient(circle,#F5CD6A_0%,#F5CD6A_35%,rgba(245,205,106,0)_70%)] opacity-80" />
        <div className="mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8B5D0E]">
              Rede Sol
            </div>
            <h1 className="max-w-[680px] text-balance font-serif text-[clamp(34px,5vw,56px)] font-semibold leading-[1.06]">
              Assistencia social e saude na Amazonia com calor humano e transparencia.
            </h1>
            <p className="mt-4 max-w-[620px] text-balance text-[15.5px] text-[#2D483A]">
              A Rede Sol apoia comunidades com acesso fluvial, conecta voluntarios e
              transforma doacoes em resposta rapida para saude, logistica e promocao social.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#campanhas"
                className="rounded-xl bg-[#C8831F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AA6D15]"
              >
                Fazer uma doacao
              </a>
              <a
                href="#frentes"
                className="rounded-xl border border-[#2A5D48]/25 bg-white/80 px-5 py-3 text-sm font-semibold text-[#1A3E31] transition hover:border-[#2A5D48]"
              >
                Ver frentes de acao
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[380px] rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_44px_rgba(28,58,46,.12)] backdrop-blur">
            <img
              src="https://optim.tildacdn.one/tild3166-6538-4637-b234-343136396538/-/cover/212x212/center/center/-/format/webp/BLOCO_1_-_LOGOTIPO.png.webp"
              alt="Logo da Rede Sol"
              className="mx-auto h-28 w-28 rounded-full border border-[#DCE7E1] bg-white object-cover"
            />
            <p className="mt-4 text-center font-serif text-lg font-semibold text-[#183C2F]">
              Fundo Rede Sol
            </p>
            <p className="mt-1 text-center text-[13px] text-[#3A5A4A]">
              Apoio continuo para manter operacao local e ampliar alcance nas comunidades.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-lg bg-[#F1F7F3] p-2">
                <strong className="block font-mono text-[#1E4C3A]">60+</strong>
                atend./mes
              </div>
              <div className="rounded-lg bg-[#FFF6E3] p-2">
                <strong className="block font-mono text-[#8B5D0E]">4</strong>
                frentes
              </div>
              <div className="rounded-lg bg-[#F1F7F3] p-2">
                <strong className="block font-mono text-[#1E4C3A]">100%</strong>
                rastreavel
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16">
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#D8E2DB] bg-white lg:grid-cols-[.9fr_1.4fr]">
          <img
            src="https://optim.tildacdn.one/tild3236-3331-4431-b739-623338333665/-/format/webp/bloco_2.png.webp"
            alt="Padrinho Sebastiao Mota de Melo"
            className="h-full w-full object-cover"
          />
          <div className="p-7 sm:p-9">
            <p className="font-serif text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.15] text-[#152F26]">
              &quot;Nossa missao tambem e ajudar esse povo. Tirar os pobres dos aperreios. Pobres,
              muito pobres, ai, coitados. Mais pobres do que eu. Porque eu tambem nao possuo
              nada, mas tenho a minha vida. E ha deles por ai que nao tem nem isso. Alem de
              doentes, esses pobres coitados passam necessidade, cheios de medo ate de viver.&quot;
            </p>
            <p className="mt-6 text-[34px] font-bold text-[#0F2D23]">Padrinho Sebastiao Mota de Melo</p>
            <p className="mt-1 text-[14px] font-semibold uppercase tracking-wide text-[#1B4032]">
              Lider comunitario, fundador da Vila Ceu do Mapia e da ICEFLU
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-[#D8E2DB] bg-white p-6 sm:p-8">
            <h2 className="max-w-[400px] font-serif text-[clamp(30px,4vw,50px)] font-semibold leading-[1.06] text-[#2D85C6]">
              Assistencia Social e Saude na Amazonia
            </h2>
            <div className="mt-5 space-y-4 text-[15px] font-semibold uppercase leading-[1.55] text-[#20382F]">
              <p>
                Um dos focos da ICEFLU e apoiar os doentes e necessitados. Padrinho Sebastiao,
                seu fundador, ressaltava a importancia da caridade, e sua casa era ponto de
                apoio para os ribeirinhos. Hoje, o departamento de desenvolvimento comunitario e
                assistencia social atende em media 60 pessoas por mes, desde bebes a idosos, com
                despesas aproximadas de 40.000 reais. A equipe conta com uma assistente social e
                voluntarios.
              </p>
              <p>
                A ICEFLU, junto com instituicoes parceiras, busca captar recursos atraves de
                projetos e campanhas para apoiar o maior numero possivel de pessoas,
                principalmente na area da saude.
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-[#FBFAF6] p-6">
              <p className="max-w-[520px] font-serif text-[clamp(28px,3.2vw,44px)] font-semibold leading-[1.12] text-[#C3A14A]">
                Contribua para o Fundo da Assistencia Social e Saude. Seja um doador permanente!
              </p>
              <a
                href="#campanhas"
                className="mt-5 inline-block rounded-xl border border-[#2D85C6] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#2D85C6] transition hover:bg-[#EAF3FB]"
              >
                Faca sua doacao aqui
              </a>
            </div>
          </div>

          <img
            src="https://optim.tildacdn.one/tild6364-3737-4365-a261-353361646536/-/cover/404x476/center/center/-/format/webp/BLOCO-1---IMAGEM-PRI.png.webp"
            alt="Moradora beneficiada pela assistencia social"
            className="h-full min-h-[360px] w-full rounded-2xl border border-[#D8E2DB] object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16">
        <h2 className="mb-4 font-serif text-[34px] font-semibold text-[#1A3E31]">Galeria de campo</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FIELD_GALLERY.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Acao social em campo ${index + 1}`}
              className="h-[180px] w-full rounded-lg border border-[#D7E2DB] object-cover"
              loading="lazy"
            />
          ))}
        </div>
      </section>

      <section id="campanhas" className="mx-auto max-w-[1140px] px-6 pb-16">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-serif text-[30px] font-semibold text-[#173A2E]">Campanhas ativas</h2>
          <a href="/pt/como-funciona" className="text-sm font-semibold text-[#1F5D45] underline-offset-2 hover:underline">
            Entenda o processo
          </a>
        </div>
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

        <div className="mt-10 rounded-2xl border border-[#E6D9BB] bg-[#FFF8EA] p-5 text-[13px] text-[#5C4A27]">
          Um dos focos da Rede Sol e apoiar doentes e necessitados em comunidades de acesso
          fluvial. O atendimento social combina equipe tecnica e voluntariado local.
        </div>
      </section>

      <section id="frentes" className="mx-auto max-w-[1140px] px-6 pb-16">
        <div className="mb-5">
          <h2 className="font-serif text-[30px] font-semibold text-[#173A2E]">Frentes de acao</h2>
          <p className="mt-1 max-w-[780px] text-[14px] text-[#486353]">
            O departamento comunitario atende territorios da floresta amazonica em quatro
            linhas de apoio integradas.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACTION_FRONTS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[#DCE7E1] bg-white p-4 shadow-[0_12px_24px_rgba(25,51,39,.06)]"
            >
              <img src={item.icon} alt={item.title} className="h-16 w-16 rounded-xl bg-[#F1F5F2] p-2" />
              <h3 className="mt-3 font-serif text-lg font-semibold text-[#1E4636]">{item.title}</h3>
              <p className="mt-1.5 text-[13px] text-[#52695D]">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[#DCE7E1] bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#173A2E]">
              Quer atuar como voluntario da Rede Sol?
            </h3>
            <p className="mt-1 text-[13px] text-[#496355]">
              Preencha o formulario unico com seu perfil, disponibilidade e habilidades.
            </p>
          </div>
          <Link
            href="/pt/voluntarios"
            className="mt-4 inline-block rounded-xl bg-[#C8831F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AA6D15] sm:mt-0"
          >
            Ir para inscricao
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1140px] px-6 pb-16">
        <div className="mb-[18px] mt-2 flex items-baseline gap-3">
          <h2 className="font-serif text-[30px] font-semibold text-[#173A2E]">
            Como manter o sistema forte
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {WHY_DONATE.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#DCE7E1] bg-[#153A2D] p-[22px] text-white"
            >
              <h4 className="mb-2 font-serif text-[18px] text-[#F0C76A]">{item.title}</h4>
              <p className="text-balance text-[12.5px] opacity-90">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-[#0F2F24] p-5 text-white">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-serif text-xl">Seja doador permanente da Rede Sol</h3>
              <p className="mt-1 text-[13px] text-white/80">
                Com contribuicao mensal, a equipe planeja rotas, compras e atendimentos com
                previsibilidade.
              </p>
            </div>
            <a
              href="#campanhas"
              className="rounded-xl bg-[#C8831F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AA6D15]"
            >
              Quero contribuir
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1140px] px-6 pb-16">
        <h2 className="font-serif text-[30px] font-semibold text-[#173A2E]">Noticias</h2>
        <div className="mt-4 grid gap-3 sm:max-w-[620px]">
          {NEWS.map((news) => (
            <Link
              key={news.href}
              href={news.href}
              className="rounded-xl border border-[#DCE7E1] bg-white p-4 transition hover:border-[#98B9AA]"
            >
              <div className="font-serif text-lg text-[#1A3B2F]">{news.title}</div>
              <div className="mt-1 text-[12px] uppercase tracking-wider text-[#688679]">
                {news.date}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
