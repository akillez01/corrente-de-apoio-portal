type Intent = "doacao" | "pedido" | "voluntariado" | "parceria" | "emergencia" | "transparencia" | "campanha" | "geral";

export interface AssistantReply {
  intent: Intent;
  title: string;
  answer: string;
  nextSteps: string[];
  ctas: Array<{ label: string; href: string }>;
}

const INTENT_RULES: Array<{ intent: Intent; keywords: string[] }> = [
  {
    intent: "emergencia",
    keywords: ["emergencia", "urgente", "socorro", "hospital", "crise", "risco", "imediato"],
  },
  {
    intent: "pedido",
    keywords: ["pedido", "apoio", "ajuda", "preciso", "solicitar", "familia", "tratamento"],
  },
  {
    intent: "campanha",
    keywords: ["campanha", "campanhas", "aprovacao", "aprovada", "publicada", "publicacao"],
  },
  {
    intent: "voluntariado",
    keywords: [
      "voluntario",
      "voluntariado",
      "inscricao",
      "participar",
      "servir",
      "habilidade",
      "medico",
      "enfermeiro",
      "advogado",
      "professor",
      "transporte",
      "governo",
      "apoio nao financeiro",
      "sem dinheiro",
    ],
  },
  {
    intent: "parceria",
    keywords: ["parceria", "empresa", "instituicao", "patrocinio", "apoio corporativo", "projeto"],
  },
  {
    intent: "doacao",
    keywords: ["doar", "doacao", "pix", "paypal", "contribuir", "arrecadar", "apoiar"],
  },
  {
    intent: "transparencia",
    keywords: ["transparencia", "prestacao", "contas", "repassado", "auditoria", "comprovante"],
  },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectIntent(message: string): Intent {
  const clean = normalize(message);
  for (const rule of INTENT_RULES) {
    if (rule.keywords.some((keyword) => clean.includes(normalize(keyword)))) {
      return rule.intent;
    }
  }
  return "geral";
}

function byIntent(intent: Intent): AssistantReply {
  if (intent === "emergencia") {
    return {
      intent,
      title: "Atendimento urgente",
      answer:
        "Se houver risco imediato à vida, procure o serviço de emergência da sua região. O portal não substitui atendimento emergencial; você também pode registrar um pedido para avaliação da equipe.",
      nextSteps: [
        "Acione o serviço de emergência local imediatamente.",
        "Depois, se desejar, registre um pedido no portal e marque a situação como urgente.",
        "A equipe avaliará o pedido; a marcação de urgência não garante atendimento imediato ou concessão de apoio.",
      ],
      ctas: [
        { label: "Criar pedido de apoio", href: "/login?next=/meus-pedidos/novo" },
        { label: "Como funciona o atendimento", href: "/pt/como-funciona" },
      ],
    };
  }

  if (intent === "pedido") {
    return {
      intent,
      title: "Solicitar apoio",
      answer:
        "Você pode iniciar um pedido privado pelo portal. A equipe fará a triagem e poderá conversar com você para compreender a necessidade e avaliar possibilidades. Enviar o pedido não garante apoio ou campanha.",
      nextSteps: [
        "Entre com sua conta para acessar o formulário.",
        "Compartilhe apenas o necessário; documentos anexados não são publicados.",
        "Acompanhe o status e as mensagens na área Meus pedidos.",
      ],
      ctas: [
        { label: "Abrir novo pedido", href: "/login?next=/meus-pedidos/novo" },
        { label: "Ver area de pedidos", href: "/login?next=/meus-pedidos" },
      ],
    };
  }

  if (intent === "voluntariado") {
    return {
      intent,
      title: "Voluntariado ICEFLU",
      answer:
        "Você pode se inscrever pelo formulário de Voluntariado e indicar habilidades, disponibilidade e formas de participação. A inscrição não presume habilitação nem garante uma oportunidade.",
      nextSteps: [
        "Preencha os dados solicitados no formulário.",
        "Descreva suas habilidades e disponibilidade, se desejar.",
        "A equipe avaliará possibilidades de participação conforme as necessidades e os critérios institucionais.",
      ],
      ctas: [{ label: "Ir para voluntariado", href: "/pt/voluntariar" }],
    };
  }

  if (intent === "parceria") {
    return {
      intent,
      title: "Parcerias e apoio institucional",
      answer:
        "A ICEFLU recebe parcerias para fortalecer o trabalho voluntario em saude, educacao, logistica e cidadania nas comunidades. O ideal e comecar por um contato direto com objetivo e tipo de apoio.",
      nextSteps: [
        "Defina como sua instituicao pode apoiar (recurso, logistica, servico ou comunicacao).",
        "Envie contato com responsavel e horizonte de colaboracao.",
        "A equipe retorna com formato de parceria viavel.",
      ],
      ctas: [
        { label: "Enviar e-mail para a equipe", href: "mailto:daimesolidariedade@gmail.com" },
        { label: "Cadastrar como voluntário", href: "/pt/voluntariar" },
      ],
    };
  }

  if (intent === "doacao") {
    return {
      intent,
      title: "Doacoes e campanhas",
      answer:
        "Consulte a lista de campanhas que foram avaliadas e publicadas. As formas de contribuição disponíveis devem ser conferidas na própria campanha; não há garantia de campanha ativa ou de pagamento habilitado.",
      nextSteps: [
        "Veja quais campanhas estão publicadas.",
        "Confira objetivo, prazo e forma de contribuição indicada em cada uma.",
        "Acompanhe as atualizações e a prestação de contas quando disponíveis.",
      ],
      ctas: [
        { label: "Ver campanhas", href: "/pt/doar" },
        { label: "Ler sobre transparência", href: "/pt/transparencia" },
      ],
    };
  }

  if (intent === "transparencia") {
    return {
      intent,
      title: "Transparencia e confianca",
      answer:
        "Campanhas passam por análise da curadoria e precisam ser publicadas separadamente antes de aparecer na página pública. A transparência deve apresentar informações verificáveis sem expor dados pessoais.",
      nextSteps: [
        "Consulte as campanhas publicadas e suas atualizações.",
        "Verifique a linha de transparência e os comprovantes que estiverem disponíveis.",
        "Auditoria independente só deve ser anunciada após definição institucional formal.",
      ],
      ctas: [
        { label: "Ver como funciona", href: "/pt/como-funciona" },
        { label: "Ver campanhas", href: "/pt/doar" },
      ],
    };
  }

  if (intent === "campanha") {
    return {
      intent,
      title: "Como uma campanha chega ao portal",
      answer:
        "Uma necessidade é analisada pela curadoria; quando uma campanha é aprovada, sua publicação ainda precisa ser liberada separadamente. Só então ela aparece na lista pública.",
      nextSteps: [
        "O pedido de apoio não é publicado automaticamente.",
        "O texto público é revisado com a pessoa antes da aprovação.",
        "A publicação não garante arrecadação nem concessão de apoio.",
      ],
      ctas: [
        { label: "Consultar campanhas publicadas", href: "/pt/doar" },
        { label: "Preciso de apoio", href: "/pt/preciso-de-ajuda" },
      ],
    };
  }

  return {
    intent: "geral",
    title: "Como posso te ajudar agora",
    answer:
      "Posso orientar sobre pedidos privados de apoio, voluntariado, campanhas publicadas, propostas de projetos e transparência.",
    nextSteps: [
      "Se precisa de apoio, você pode iniciar um pedido privado.",
      "Se quer participar, conheça o formulário de voluntariado.",
      "Campanhas só aparecem depois de avaliação e publicação.",
    ],
    ctas: [
      { label: "Preciso de apoio", href: "/pt/preciso-de-ajuda" },
      { label: "Ver campanhas", href: "/pt/doar" },
      { label: "Voluntariado", href: "/pt/voluntariar" },
    ],
  };
}

export function buildAssistantReply(message: string): AssistantReply {
  const intent = detectIntent(message);
  return byIntent(intent);
}
