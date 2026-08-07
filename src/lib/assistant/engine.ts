type Intent = "doacao" | "pedido" | "voluntariado" | "parceria" | "emergencia" | "transparencia" | "geral";

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
    intent: "voluntariado",
    keywords: ["voluntario", "voluntariado", "inscricao", "participar", "servir", "habilidade"],
  },
  {
    intent: "parceria",
    keywords: ["parceria", "empresa", "instituicao", "patrocinio", "apoio corporativo", "projeto"],
  },
  {
    intent: "doacao",
    keywords: ["doar", "doacao", "pix", "paypal", "contribuir", "campanha", "arrecadar"],
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
        "Se houver risco imediato de vida, procure o servico medico de emergencia da sua regiao agora. Em paralelo, a Rede Sol pode organizar o fluxo social de apoio para o caso.",
      nextSteps: [
        "Acione atendimento medico local imediatamente.",
        "Depois registre o pedido no portal com detalhes basicos.",
        "Marque o caso como urgente para priorizacao da curadoria.",
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
        "Para receber atendimento da Rede Sol, o caminho oficial e abrir um pedido no sistema. A equipe de curadoria analisa os dados, conversa com a familia e decide os proximos passos.",
      nextSteps: [
        "Entre com sua conta no portal.",
        "Preencha o formulario com descricao, meta e anexos.",
        "Acompanhe status e mensagens em Meus pedidos.",
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
      title: "Voluntariado Rede Sol",
      answer:
        "Voce pode se inscrever pelo formulario oficial de voluntariado. A equipe avalia perfil, disponibilidade e aderencia com as demandas em campo.",
      nextSteps: [
        "Preencha todos os campos obrigatorios do formulario.",
        "Descreva claramente suas habilidades e disponibilidade.",
        "Aguarde retorno por e-mail da equipe.",
      ],
      ctas: [{ label: "Ir para voluntariado", href: "/pt/voluntarios" }],
    };
  }

  if (intent === "parceria") {
    return {
      intent,
      title: "Parcerias e apoio institucional",
      answer:
        "A Rede Sol recebe parcerias para fortalecer saude, logistica e promocao social nas comunidades. O ideal e comecar por um contato direto com objetivo e tipo de apoio.",
      nextSteps: [
        "Defina como sua instituicao pode apoiar (recurso, logistica, servico ou comunicacao).",
        "Envie contato com responsavel e horizonte de colaboracao.",
        "A equipe retorna com formato de parceria viavel.",
      ],
      ctas: [
        { label: "Enviar e-mail para a equipe", href: "mailto:as.social.iceflu@gmail.com" },
        { label: "Ver frentes de acao", href: "/pt#frentes" },
      ],
    };
  }

  if (intent === "doacao") {
    return {
      intent,
      title: "Doacoes e campanhas",
      answer:
        "Voce pode apoiar campanhas ativas diretamente no portal. O sistema exibe progresso, status e prestacao de contas para cada campanha.",
      nextSteps: [
        "Abra uma campanha ativa.",
        "Escolha a forma de contribuicao disponivel.",
        "Acompanhe a evolucao e a prestacao de contas.",
      ],
      ctas: [
        { label: "Ver campanhas ativas", href: "/pt#campanhas" },
        { label: "Ler sobre transparencia", href: "/pt/como-funciona" },
      ],
    };
  }

  if (intent === "transparencia") {
    return {
      intent,
      title: "Transparencia e confianca",
      answer:
        "A Rede Sol trabalha com curadoria antes da publicacao, segregacao de funcao no repasse e prestacao de contas publica por campanha.",
      nextSteps: [
        "Consulte campanhas com prestacao publicada.",
        "Verifique linha de transparencia e comprovantes.",
        "Em caso de duvida, fale com a equipe de assistencia social.",
      ],
      ctas: [
        { label: "Ver como funciona", href: "/pt/como-funciona" },
        { label: "Ver noticias e resultados", href: "/pt/noticias/fazenda-sao-sebastiao-internet" },
      ],
    };
  }

  return {
    intent: "geral",
    title: "Como posso te ajudar agora",
    answer:
      "Posso orientar em doacoes, pedidos de apoio, voluntariado, parcerias e transparencia da Rede Sol.",
    nextSteps: [
      "Se quiser ajudar: veja campanhas ativas.",
      "Se precisar de apoio: abra um pedido no portal.",
      "Se quiser participar: preencha o formulario de voluntariado.",
    ],
    ctas: [
      { label: "Campanhas", href: "/pt#campanhas" },
      { label: "Novo pedido", href: "/login?next=/meus-pedidos/novo" },
      { label: "Voluntariado", href: "/pt/voluntarios" },
    ],
  };
}

export function buildAssistantReply(message: string): AssistantReply {
  const intent = detectIntent(message);
  return byIntent(intent);
}
