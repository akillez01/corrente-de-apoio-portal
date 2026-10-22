// Opções do cadastro de acolhimento ("Preciso de ajuda"), compartilhadas entre o
// formulário e a API — seguem a referência usada pelo Serviço Social.

export const CATEGORIAS_DEMANDA = [
  "Alimentação",
  "Moradia",
  "Renda",
  "Trabalho",
  "Documentação",
  "Educação",
  "Saúde",
  "Transporte",
  "Benefícios",
  "Situação emergencial",
  "Violação de direitos",
  "Apoio a projetos",
  "Demandas comunitárias",
  "Outras",
] as const;

export const FORMAS_CONTATO = ["E-mail", "Telefone", "WhatsApp"] as const;
export type FormaContato = (typeof FORMAS_CONTATO)[number];

export const SITUACOES_TRABALHO = [
  "Trabalho com carteira assinada",
  "Trabalho informal",
  "Autônomo(a)",
  "Desempregado(a)",
  "Aposentado(a) ou pensionista",
  "Estudante",
  "Do lar / cuidados da família",
  "Outra",
] as const;

export const FAIXAS_RENDA = [
  "Sem renda",
  "Até 1 salário mínimo",
  "De 1 a 2 salários mínimos",
  "De 2 a 3 salários mínimos",
  "Acima de 3 salários mínimos",
  "Prefiro não informar",
] as const;

export const SITUACOES_ALIMENTARES = [
  "Alimentação garantida",
  "Às vezes falta alimento",
  "Falta alimento com frequência",
  "Prefiro conversar com a equipe",
] as const;

export const SITUACOES_HABITACIONAIS = [
  "Casa própria",
  "Alugada",
  "Cedida ou emprestada",
  "Ocupação",
  "Abrigo ou acolhimento",
  "Sem moradia",
  "Outra",
] as const;

export const SOCIOECONOMIC_FIELDS = [
  "situacaoTrabalho",
  "renda",
  "fontesRenda",
  "beneficios",
  "despesasEssenciais",
  "situacaoAlimentar",
  "situacaoHabitacional",
] as const;

export const FAMILY_FIELDS = [
  "integrantes",
  "faixaEtaria",
  "dependentes",
  "composicaoDomiciliar",
  "outrasInformacoes",
] as const;
