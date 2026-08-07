import Link from "next/link";

export const revalidate = 3600;

export default function NoticiaFazendaPage() {
  return (
    <main className="mx-auto w-full max-w-[860px] px-6 pb-16 pt-10">
      <article className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="mb-4 inline-flex rounded-full bg-[#F2F7F3] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#2F6B4F]">
          Noticias
        </div>

        <h1 className="text-balance font-serif text-[clamp(28px,4.5vw,42px)] font-semibold text-[#173A2E]">
          Fazenda Sao Sebastiao passa a ter acesso a internet
        </h1>
        <p className="mt-2 text-[13px] font-semibold uppercase tracking-wider text-[#678477]">
          09.11.2023
        </p>

        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#334B40]">
          <p>
            Em agosto deste ano, com o apoio da ONG El Puente, foi instalado o acesso a
            internet na Fazenda Sao Sebastiao, no Igarape Mapia, onde residem cerca de 80
            pessoas.
          </p>
          <p>
            Foi um grande avanco para a comunidade, pois ate entao a comunicacao no local era
            limitada. A internet esta disponivel para a escola, para a associacao local, para
            questoes de trabalho e para emergencias. O uso e regulado com base em acordos
            estabelecidos entre os proprios moradores.
          </p>
          <p>
            Alem disso, desde o ano passado, a Fazenda conta com energia solar nas instalacoes
            comunitarias. A escola local tambem recebeu benfeitorias: foi reformada com
            recursos da campanha realizada por Frei Betto e funciona por meio da parceria entre
            a Escola Estadual Cruzeiro do Ceu, da Vila Ceu do Mapia, a Prefeitura de Pauini e o
            Instituto Socioambiental de Vicosa.
          </p>
          <p>
            A Fazenda Sao Sebastiao ainda necessita de apoio para melhoria das moradias e das
            estruturas comunitarias. Nao ha saneamento basico nem energia eletrica para as casas
            da comunidade. A saude tambem precisa de suporte constante.
          </p>
          <p>
            Para ter acesso aos servicos de saude, as pessoas precisam se deslocar por via
            fluvial ate a cidade mais proxima, em uma viagem de aproximadamente quatro horas.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-[#E8D6B4] bg-[#FFF7E7] p-4 text-[#5D4A22]">
          <p className="font-semibold">Visite a comunidade e seja um apoiador.</p>
          <p className="mt-1 text-[13px]">
            Seu apoio fortalece saude, educacao e infraestrutura para as familias locais.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/pt#campanhas"
            className="rounded-xl bg-[#C8831F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AA6D15]"
          >
            Apoiar campanhas
          </Link>
          <Link
            href="/pt"
            className="rounded-xl border border-[#2A5D48]/25 bg-[#F2F7F3] px-5 py-3 text-sm font-semibold text-[#1A3E31] transition hover:border-[#2A5D48]"
          >
            Voltar para inicio
          </Link>
        </div>
      </article>
    </main>
  );
}
