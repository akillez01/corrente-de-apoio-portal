import { VoluntarioForm } from "@/components/voluntarios/VoluntarioForm";
import Link from "next/link";

const DIVULGACAO = [
  {
    title: "WhatsApp comunitario",
    text: "Use o link desta pagina nos grupos das comunidades e padrinhos locais com chamada curta e objetiva.",
  },
  {
    title: "Mutirao mensal de inscricao",
    text: "Promova uma live curta por mes para explicar o programa e direcionar para o formulario unico.",
  },
  {
    title: "Rede de parceiros",
    text: "Mapeie igrejas, escolas e coletivos para replicar o link de voluntariado com identidade visual padrao.",
  },
  {
    title: "Conteudo de impacto",
    text: "Publique noticias de resultado e transforme cada materia em convite para novos voluntarios.",
  },
];

export const revalidate = 0;

export default function VoluntariosPage() {
  return (
    <main className="mx-auto w-full max-w-[1140px] px-6 pb-16 pt-10">
      <section className="mb-8 rounded-3xl border border-[#E5D7B7] bg-[linear-gradient(150deg,#FFF8E8_0%,#F2F7F3_70%)] p-6 sm:p-8">
        <div className="mb-2 inline-flex rounded-full bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#846116]">
          Rede Sol
        </div>
        <h1 className="max-w-[900px] text-balance font-serif text-[clamp(30px,4.3vw,48px)] font-semibold text-[#173A2E]">
          Formulario de inscricao para voluntarios da assistencia social e saude em comunidades na Amazonia
        </h1>
        <p className="mt-3 max-w-[920px] text-[14px] text-[#3C584A]">
          Programa de Solidariedade, Voluntariado e Servicos. Preencha este formulario para
          participar das acoes da Rede Sol com atuacao remota e/ou presencial nas comunidades.
        </p>
        <div className="mt-4 max-w-[940px] rounded-2xl border border-[#E5D7B7] bg-white/80 p-4">
          <h2 className="font-serif text-[24px] font-semibold text-[#1A3E31]">Solidariedade e o motor do sistema</h2>
          <p className="mt-2 text-[14px] text-[#3E584B]">
            Na Rede Sol, solidariedade nao e apenas um valor abstrato: e uma pratica concreta que
            organiza todo o fluxo da plataforma. Cada inscricao de voluntario, cada doacao, cada
            validacao de curadoria e cada comprovacao no financeiro formam uma corrente de cuidado
            coletivo que transforma recursos em resposta real para quem mais precisa.
          </p>
          <p className="mt-2 text-[14px] text-[#3E584B]">
            Quando voce participa, ajuda a manter ativa uma rede que conecta pessoas,
            responsabilidades e resultados com transparencia, respeito e compromisso social.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="#inscricao"
            className="rounded-xl bg-[#C8831F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AA6D15]"
          >
            Quero me inscrever
          </a>
          <Link
            href="/pt/noticias/fazenda-sao-sebastiao-internet"
            className="rounded-xl border border-[#2A5D48]/25 bg-white px-5 py-3 text-sm font-semibold text-[#1A3E31] transition hover:border-[#2A5D48]"
          >
            Ver impacto em campo
          </Link>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-serif text-2xl font-semibold text-[#173A2E]">Como funciona</h2>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-4 text-[14px] text-[#3E584B]">
            <li>Voce envia a inscricao com seu perfil, disponibilidade e habilidades.</li>
            <li>A equipe avalia aderencia e prioridade das demandas atuais.</li>
            <li>Voce recebe retorno por e-mail com proximos passos de integracao.</li>
            <li>Quando aplicavel, entra na trilha de atuacao presencial nas comunidades.</li>
          </ol>
        </article>

        <article className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-serif text-2xl font-semibold text-[#173A2E]">Divulgacao viavel para este sistema</h2>
          <div className="mt-3 grid grid-cols-1 gap-2.5 text-[13px] text-[#3E584B]">
            {DIVULGACAO.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-bg p-3">
                <h3 className="font-semibold text-[#1B4233]">{item.title}</h3>
                <p className="mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mb-8 rounded-2xl border border-[#D7E3DC] bg-[linear-gradient(145deg,#F8FBF9_0%,#EEF6F1_58%,#FFFFFF_100%)] p-5 sm:p-6">
        <div className="inline-flex rounded-full border border-[#2A5D48]/20 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#2A5D48]">
          Sustentacao da plataforma
        </div>
        <h2 className="mt-3 max-w-[780px] font-serif text-[clamp(26px,4vw,38px)] font-semibold leading-tight text-[#173A2E]">
          Ajude a manter viva a estrutura do sistema Rede Sol
        </h2>
        <p className="mt-3 max-w-[860px] text-[14px] text-[#3E584B]">
          Sua doacao para o fundo da plataforma fortalece conectividade, suporte tecnico,
          manutencao de seguranca e operacao dos fluxos que conectam doadores, voluntarios e
          familias atendidas. Em outras palavras, voce sustenta a infraestrutura da solidariedade
          que move o sistema inteiro, permitindo que a ajuda chegue com continuidade e
          transparencia.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/pt#campanhas"
            className="rounded-xl bg-[#2A5D48] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#214A3A]"
          >
            Doar para manter a plataforma
          </Link>
          <Link
            href="/pt/como-funciona"
            className="rounded-xl border border-[#2A5D48]/25 bg-white px-5 py-3 text-sm font-semibold text-[#1A3E31] transition hover:border-[#2A5D48]"
          >
            Ver como os recursos sao aplicados
          </Link>
        </div>
      </section>

      <section id="inscricao">
        <VoluntarioForm />
      </section>
    </main>
  );
}
