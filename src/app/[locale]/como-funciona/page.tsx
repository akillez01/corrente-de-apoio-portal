const ETAPAS = [
  {
    numero: 1,
    titulo: "Pedido",
    texto: "O irmão ou irmã descreve a necessidade, a meta e o prazo, com documentos anexados em área privada.",
  },
  {
    numero: 2,
    titulo: "Análise e alinhamento",
    texto: "A equipe social conversa com a família, valida valores e escreve junto o texto que vai ao ar.",
  },
  {
    numero: 3,
    titulo: "Campanha",
    texto: "Publicada com o selo da instituição, o link circula pelas irmandades do mundo inteiro.",
  },
  {
    numero: 4,
    titulo: "Doação direta",
    texto: "Pix e PayPal caem na conta institucional. O progresso atualiza sozinho, sem trabalho manual.",
  },
  {
    numero: 5,
    titulo: "Repasse",
    texto: "O financeiro repassa ao beneficiário e anexa o comprovante no sistema.",
  },
  {
    numero: 6,
    titulo: "Prestação de contas",
    texto: "Extrato e comprovante ficam públicos na página da campanha, para sempre.",
  },
];

const SALVAGUARDAS = [
  {
    titulo: "Curadoria obrigatória",
    texto:
      "Tecnicamente impossível publicar campanha sem aprovação da equipe social. O texto público é sempre reescrito pela curadoria; laudos e documentos nunca vão ao ar.",
  },
  {
    titulo: "Segregação de função",
    texto:
      "Quem aprova não repassa. Toda ação administrativa fica registrada em log de auditoria imutável, com autor, horário e encadeamento por hash.",
  },
  {
    titulo: "LGPD desde o desenho",
    texto:
      "Dados de saúde tratados como sensíveis, com consentimento explícito, acesso restrito por papel e política de retenção configurável.",
  },
  {
    titulo: "Sem custódia de dinheiro",
    texto:
      "O sistema não toca no dinheiro. Doações vão direto do doador para a conta institucional pelo provedor de pagamento.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <main className="mx-auto max-w-[1080px] px-6 py-9">
      <h1 className="mb-5 font-serif text-2xl font-semibold">Como funciona</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        {ETAPAS.map((etapa) => (
          <div key={etapa.numero} className="rounded-xl border border-border bg-white p-5">
            <div className="mb-2 font-serif text-2xl font-bold text-accent">{etapa.numero}</div>
            <h4 className="mb-1.5 font-serif text-base font-semibold">{etapa.titulo}</h4>
            <p className="text-balance text-[12.5px] text-muted">{etapa.texto}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-[18px] mt-10 font-serif text-2xl font-semibold">O que protege a instituição</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
        {SALVAGUARDAS.map((item) => (
          <div key={item.titulo} className="rounded-2xl bg-header p-[22px] text-white">
            <h4 className="mb-2 font-serif text-[17px] text-accent">{item.titulo}</h4>
            <p className="text-balance text-[12.5px] opacity-85">{item.texto}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
