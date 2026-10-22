// Opções do cadastro de voluntários, compartilhadas entre o formulário, a API e o
// diretório interno. Os valores ficam em português (e sem acento, por compatibilidade
// com inscrições antigas); só os rótulos exibidos mudam por idioma.

export const AREAS_ATUACAO = [
  "Saude e cuidado",
  "Direito e cidadania",
  "Ensino e formacao",
  "Transporte e logistica",
  "Governo e politicas publicas",
  "Comunicacao e captacao",
  "Tecnologia e dados",
  "Administracao e gestao",
  "Construcao e manutencao",
  "Arte e cultura",
  "Meio ambiente e agricultura",
  "Outra area",
] as const;

export const AREA_LABELS: Record<string, { pt: string; en: string }> = {
  "Saude e cuidado": { pt: "Saúde e cuidado", en: "Health & care" },
  "Direito e cidadania": { pt: "Direito e cidadania", en: "Law & citizenship" },
  "Ensino e formacao": { pt: "Ensino e formação", en: "Education & training" },
  "Transporte e logistica": { pt: "Transporte e logística", en: "Transportation & logistics" },
  "Governo e politicas publicas": { pt: "Governo e políticas públicas", en: "Government & public policy" },
  "Comunicacao e captacao": { pt: "Comunicação e captação", en: "Communications & fundraising" },
  "Tecnologia e dados": { pt: "Tecnologia e dados", en: "Technology & data" },
  "Administracao e gestao": { pt: "Administração e gestão", en: "Administration & management" },
  "Construcao e manutencao": { pt: "Construção e manutenção", en: "Construction & maintenance" },
  "Arte e cultura": { pt: "Arte e cultura", en: "Arts & culture" },
  "Meio ambiente e agricultura": { pt: "Meio ambiente e agricultura", en: "Environment & agriculture" },
  "Outra area": { pt: "Outra área", en: "Other area" },
};

export const OFERTAS = [
  "Profissão",
  "Formação",
  "Habilidades",
  "Conhecimentos",
  "Serviços",
  "Equipamentos",
  "Materiais",
  "Espaço",
  "Tempo",
  "Voluntariado",
  "Recursos financeiros",
  "Participação em projetos",
] as const;

export const OFERTA_LABELS_EN: Record<string, string> = {
  Profissão: "Profession",
  Formação: "Education",
  Habilidades: "Skills",
  Conhecimentos: "Knowledge",
  Serviços: "Services",
  Equipamentos: "Equipment",
  Materiais: "Materials",
  Espaço: "Space",
  Tempo: "Time",
  Voluntariado: "Volunteering",
  "Recursos financeiros": "Financial resources",
  "Participação em projetos": "Joining projects",
};

export const MODALIDADES = ["Remoto", "Presencial", "Remoto e presencial"] as const;

export const MODALIDADE_LABELS_EN: Record<string, string> = {
  Remoto: "Remote",
  Presencial: "In person",
  "Remoto e presencial": "Remote and in person",
};
