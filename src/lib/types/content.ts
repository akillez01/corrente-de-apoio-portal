export interface HomeContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimaryLabel: string;
  heroCtaSecondaryLabel: string;
  principleLabel: string;
  principleTitle: string;
  principleText: string;
  participationEyebrow: string;
  participationTitle: string;
  participationSubtitle: string;
  storyEyebrow: string;
  storyTitle: string;
  storyText: string;
  campaignsEyebrow: string;
  campaignsTitle: string;
  campaignsEmptyTitle: string;
  campaignsEmptyText: string;
  transparencyCta: string;
  abundanceTitle: string;
}

export const HOME_CONTENT_FIELDS: (keyof HomeContent)[] = [
  "heroBadge",
  "heroTitle",
  "heroSubtitle",
  "heroCtaPrimaryLabel",
  "heroCtaSecondaryLabel",
  "principleLabel",
  "principleTitle",
  "principleText",
  "participationEyebrow",
  "participationTitle",
  "participationSubtitle",
  "storyEyebrow",
  "storyTitle",
  "storyText",
  "campaignsEyebrow",
  "campaignsTitle",
  "campaignsEmptyTitle",
  "campaignsEmptyText",
  "transparencyCta",
  "abundanceTitle",
];

export function isHomeContent(value: unknown): value is HomeContent {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return HOME_CONTENT_FIELDS.every((field) => {
    const text = Reflect.get(value, field);
    return typeof text === "string" && text.length <= 3000;
  });
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroBadge: "Uma rede de cuidado, colaboração e abundância",
  heroTitle: "Cada um tem algo para oferecer.",
  heroSubtitle:
    "Conectamos pessoas, capacidades, recursos e projetos para transformar a solidariedade em cuidado concreto — em todas as formas que ela pode assumir.",
  heroCtaPrimaryLabel: "Conheça o Daime Solidariedade",
  heroCtaSecondaryLabel: "Como posso participar?",
  principleLabel: "O princípio que nos une",
  principleTitle: "“É dando que se recebe.”",
  principleText:
    "Oferecer e receber fazem parte do mesmo movimento. A troca é convite à participação, nunca uma obrigação para quem precisa de apoio.",
  participationEyebrow: "Uma rede de muitas formas",
  participationTitle: "Como você quer participar?",
  participationSubtitle: "Dinheiro é apenas uma das formas de solidariedade. Escolha por onde começar.",
  storyEyebrow: "Uma história de cuidado",
  storyTitle: "Um legado que segue florescendo.",
  storyText:
    "O Daime Solidariedade nasce do legado da Madrinha Rita Gregório de Melo e do Centenário de Integração. Queremos cultivar na irmandade o exemplo de uma vida dedicada à caridade, à união e ao cuidado.",
  campaignsEyebrow: "Apoio com transparência",
  campaignsTitle: "Campanhas",
  campaignsEmptyTitle: "Novas campanhas serão publicadas aqui.",
  campaignsEmptyText:
    "Cada campanha passa por avaliação e aprovação antes de ser divulgada. Enquanto isso, você pode conhecer a rede ou oferecer uma capacidade.",
  transparencyCta: "Conheça nossos compromissos",
  abundanceTitle: "Abundância é aquilo que fazemos circular para gerar vida.",
};

export const DEFAULT_HOME_CONTENT_EN: HomeContent = {
  heroBadge: "A network of care, collaboration, and abundance",
  heroTitle: "Everyone has something to offer.",
  heroSubtitle:
    "We connect people, skills, resources, and projects to turn solidarity into practical care — in all the ways it can take shape.",
  heroCtaPrimaryLabel: "Discover Daime Solidariedade",
  heroCtaSecondaryLabel: "How can I take part?",
  principleLabel: "The principle that unites us",
  principleTitle: "“In giving, we receive.”",
  principleText:
    "Offering and receiving are part of the same movement. Reciprocity is an invitation to participate, never an obligation for someone seeking support.",
  participationEyebrow: "A network of many possibilities",
  participationTitle: "How would you like to take part?",
  participationSubtitle: "Money is only one form of solidarity. Choose where to begin.",
  storyEyebrow: "A legacy of care",
  storyTitle: "A legacy that keeps growing.",
  storyText:
    "Daime Solidariedade is rooted in the legacy of Madrinha Rita Gregório de Melo and the Centenary of Integration. We hope to nurture in the community her example of a life dedicated to charity, unity, and care.",
  campaignsEyebrow: "Support with transparency",
  campaignsTitle: "Campaigns",
  campaignsEmptyTitle: "New campaigns will be published here.",
  campaignsEmptyText:
    "Each campaign is reviewed and approved before publication. In the meantime, discover the network or offer one of your skills.",
  transparencyCta: "Our commitments",
  abundanceTitle: "Abundance is what we set in motion to bring life.",
};
