// Popula os emuladores (Firestore + Auth) com dados fictícios para desenvolvimento local.
// Uso: FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node scripts/seed-emulator.js
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs/promises");
const path = require("path");

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "corrente-de-apoio";

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error(
    "FIRESTORE_EMULATOR_HOST e FIREBASE_AUTH_EMULATOR_HOST precisam estar setados. Ex.:\n" +
      "  FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node scripts/seed-emulator.js",
  );
  process.exit(1);
}

const app = initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);
const auth = getAuth(app);
const STORAGE_ROOT = path.resolve(process.env.STORAGE_DIR ?? "./.data/uploads");

const now = new Date().toISOString();

const DEMO_PASSWORD = "senha123";
const demoUsers = [
  { email: "curadoria@corrente.dev", nome: "Ana Meirelles", role: "curador" },
  { email: "servicosocial@corrente.dev", nome: "Helena Prado", role: "assistente_social" },
  { email: "financeiro@corrente.dev", nome: "Marcos D'Ávila", role: "financeiro" },
  { email: "admin@corrente.dev", nome: "Iceflu Admin", role: "admin" },
  { email: "requerente@corrente.dev", nome: "Joana Ribeiro", role: "requerente" },
];

async function seedUsers() {
  const uids = {};
  for (const u of demoUsers) {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(u.email);
      await auth.updateUser(userRecord.uid, {
        password: DEMO_PASSWORD,
        displayName: u.nome,
      });
    } catch {
      userRecord = await auth.createUser({
        email: u.email,
        password: DEMO_PASSWORD,
        displayName: u.nome,
      });
    }
    await auth.setCustomUserClaims(userRecord.uid, { role: u.role, name: u.nome });
    await db.collection("users").doc(userRecord.uid).set({
      nome: u.nome,
      email: u.email,
      role: u.role,
      idioma: "pt",
    });
    uids[u.role] = userRecord.uid;
  }
  return uids;
}

const campaigns = [
  {
    id: "cirurgia-rafael",
    slug: "cirurgia-cardiaca-rafael",
    titulo: "Cirurgia cardíaca do pequeno Rafael",
    categoria: "Saúde",
    urgente: true,
    resumoPublico:
      "Criança de 2 anos da irmandade do Céu da Mata precisa de cirurgia com equipe especializada. Família acompanhada pela equipe social.",
    textoPublico: [
      "Rafael tem 2 anos e é filho de uma família que acompanha os trabalhos desde a fundação da igreja local. Ele precisa de uma cirurgia cardíaca com equipe especializada, além de exames pré-operatórios e acompanhamento pós-cirúrgico.",
      "A equipe social da instituição visitou a família, reuniu os orçamentos médicos e validou os valores com o hospital. Este texto foi revisado e aprovado junto com a família, preservando as informações sensíveis.",
      "Todo valor arrecadado será repassado diretamente para os custos do tratamento. Se a arrecadação superar a meta, o excedente será destinado ao fundo social da instituição, conforme regulamento.",
    ],
    meta: 50000,
    arrecadado: 32140,
    moeda: "BRL",
    status: "publicado",
    doacoesCount: 217,
    verificadoEm: "2026-07-28",
    aprovadoPor: "Ana Meirelles (curadoria)",
    criadoEm: now,
    atualizadoEm: now,
  },
  {
    id: "casa-dona-marta",
    slug: "reconstrucao-casa-dona-marta",
    titulo: "Reconstrução da casa de Dona Marta",
    categoria: "Moradia",
    urgente: false,
    resumoPublico:
      "Enchente comprometeu a estrutura da casa. Campanha para material de construção e mão de obra, com orçamentos validados pela equipe.",
    textoPublico: [
      "Dona Marta é membro da irmandade há mais de 20 anos. A enchente de junho comprometeu a estrutura da casa onde vive com dois netos.",
      "A equipe social visitou o imóvel, reuniu três orçamentos de material e mão de obra, e acompanha a obra semanalmente junto ao mestre de obras responsável.",
      "O valor arrecadado cobre material de construção, mão de obra e um reforço na fundação identificado como necessário na vistoria.",
    ],
    meta: 18000,
    arrecadado: 5580,
    moeda: "BRL",
    status: "publicado",
    doacoesCount: 64,
    verificadoEm: "2026-07-15",
    aprovadoPor: "Ana Meirelles (curadoria)",
    criadoEm: now,
    atualizadoEm: now,
  },
  {
    id: "cadeira-seu-elias",
    slug: "cadeira-rodas-seu-elias",
    titulo: "Cadeira de rodas motorizada para Seu Elias",
    categoria: "Saúde",
    urgente: false,
    resumoPublico:
      "Meta atingida em 11 dias com apoio de irmandades de 6 países. Equipamento entregue e comprovante de repasse publicado.",
    textoPublico: [
      "Seu Elias precisava de uma cadeira de rodas motorizada após uma perda de mobilidade progressiva. A campanha atingiu a meta em apenas 11 dias, com apoio de irmandades de 6 países.",
      "O equipamento foi comprado, entregue à família e o repasse foi confirmado pelo financeiro com comprovante anexado, publicado abaixo.",
    ],
    meta: 12000,
    arrecadado: 12300,
    moeda: "BRL",
    status: "prestacao_publicada",
    doacoesCount: 217,
    verificadoEm: "2026-07-03",
    aprovadoPor: "Ana Meirelles (curadoria)",
    criadoEm: now,
    atualizadoEm: now,
  },
];

const donations = [
  { id: "doa-1", campaignId: "cirurgia-rafael", valor: 100, moeda: "BRL", metodo: "pix", anonimo: true, nome: null, externalId: "seed-1", criadoEm: now },
  { id: "doa-2", campaignId: "cirurgia-rafael", valor: 250, moeda: "BRL", metodo: "paypal", anonimo: false, nome: "Irmandade Céu Aberto", externalId: "seed-2", criadoEm: now },
  { id: "doa-3", campaignId: "cirurgia-rafael", valor: 50, moeda: "BRL", metodo: "pix", anonimo: true, nome: null, externalId: "seed-3", criadoEm: now },
  { id: "doa-4", campaignId: "cadeira-seu-elias", valor: 300, moeda: "BRL", metodo: "pix", anonimo: false, nome: "Comunidade Boa Vista", externalId: "seed-4", criadoEm: now },
];

const transfers = [
  {
    id: "rep-cadeira-seu-elias",
    campaignId: "cadeira-seu-elias",
    valor: 12300,
    data: "2026-07-16",
    comprovanteUrl: null,
    confirmadoPor: "Marcos D'Ávila (financeiro)",
  },
];

async function seedAttachment(requestId, filename, text) {
  const relativePath = `requests/${requestId}/${filename}`;
  const fullPath = path.join(STORAGE_ROOT, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, text, "utf8");
  return { nome: filename, path: relativePath, contentType: "text/plain", size: Buffer.byteLength(text) };
}

async function seed() {
  const uids = await seedUsers();

  // Campanha extra já com meta atingida, aguardando repasse — exercita a tela do financeiro.
  const financeCampaign = {
    id: "reforma-capela",
    slug: "reforma-capela-comunitaria",
    titulo: "Reforma da capela comunitária",
    categoria: "Infraestrutura",
    urgente: false,
    resumoPublico:
      "Telhado da capela comprometido após temporal. Meta atingida em 9 dias, aguardando confirmação do repasse pelo financeiro.",
    textoPublico: [
      "O temporal de maio comprometeu parte do telhado da capela usada pela comunidade para encontros semanais.",
      "A meta foi atingida em 9 dias. O valor aguarda confirmação de repasse pelo financeiro, com segregação de função em relação à curadoria que aprovou.",
    ],
    meta: 9000,
    arrecadado: 9450,
    moeda: "BRL",
    status: "meta_atingida",
    doacoesCount: 58,
    verificadoEm: "2026-07-20",
    aprovadoPor: "Ana Meirelles (curadoria)",
    aprovadoPorUid: uids.curador,
    criadoEm: now,
    atualizadoEm: now,
  };

  const anexoLaudo = await seedAttachment(
    "req-cadeira-banho",
    "laudo-medico.txt",
    "Laudo fictício (seed) — indicação de cadeira de banho adaptada para mobilidade reduzida.",
  );

  const requests = [
    {
      id: "req-cadeira-banho",
      requerenteId: uids.requerente,
      requerenteNome: "Joana Ribeiro",
      titulo: "Cadeira de banho adaptada para minha mãe",
      categoria: "Saúde",
      urgente: false,
      meta: 800,
      prazo: null,
      descricao:
        "Minha mãe teve mobilidade reduzida após uma queda e o médico indicou uma cadeira de banho adaptada. Anexei o laudo médico.",
      textoPublico: "",
      anexos: [anexoLaudo],
      consentimentoLgpdEm: now,
      status: "submetido",
      mensagens: [],
      criadoEm: now,
      atualizadoEm: now,
    },
    {
      id: "req-material-escolar",
      requerenteId: uids.requerente,
      requerenteNome: "Joana Ribeiro",
      titulo: "Material escolar para os três filhos",
      categoria: "Educação",
      urgente: false,
      meta: 600,
      prazo: null,
      descricao:
        "Perdi o emprego em junho e não consigo comprar material escolar para o novo ano letivo dos três filhos.",
      textoPublico: "Rascunho inicial: família busca apoio com material escolar após perda de renda.",
      anexos: [],
      consentimentoLgpdEm: now,
      status: "em_analise",
      mensagens: [],
      criadoEm: now,
      atualizadoEm: now,
    },
    {
      id: "req-tratamento-dentario",
      requerenteId: uids.requerente,
      requerenteNome: "Joana Ribeiro",
      titulo: "Tratamento dentário urgente",
      categoria: "Saúde",
      urgente: true,
      meta: 3200,
      prazo: null,
      descricao: "Preciso de um tratamento de canal urgente e não tenho condições de pagar.",
      textoPublico: "Rascunho: apoio para tratamento odontológico urgente.",
      anexos: [],
      consentimentoLgpdEm: now,
      status: "em_alinhamento",
      mensagens: [
        {
          autor: "Ana Meirelles",
          texto: "Oi Joana, para seguir preciso do orçamento assinado pela clínica. Pode enviar?",
          criadoEm: now,
        },
      ],
      criadoEm: now,
      atualizadoEm: now,
    },
    {
      id: "req-conserto-telhado",
      requerenteId: uids.requerente,
      requerenteNome: "Joana Ribeiro",
      titulo: "Conserto do telhado após temporal",
      categoria: "Moradia",
      urgente: false,
      meta: 2500,
      prazo: null,
      descricao: "O temporal da semana passada abriu um buraco no telhado da cozinha.",
      textoPublico: "",
      anexos: [],
      consentimentoLgpdEm: now,
      status: "reprovado",
      motivoReprovacao:
        "Não foi possível confirmar o vínculo com a irmandade local. Entre em contato com a secretaria para regularizar o cadastro antes de reenviar.",
      mensagens: [],
      criadoEm: now,
      atualizadoEm: now,
    },
  ];

  const batch = db.batch();
  for (const campaign of [...campaigns, financeCampaign]) {
    const { id, ...data } = campaign;
    batch.set(db.collection("campaigns").doc(id), data);
  }
  for (const donation of donations) {
    const { id, ...data } = donation;
    batch.set(db.collection("donations").doc(id), data);
  }
  for (const transfer of transfers) {
    const { id, ...data } = transfer;
    batch.set(db.collection("transfers").doc(id), data);
  }
  for (const request of requests) {
    const { id, ...data } = request;
    batch.set(db.collection("requests").doc(id), data);
  }
  await batch.commit();

  console.log(
    `Seed concluído: ${demoUsers.length} usuários, ${campaigns.length + 1} campanhas, ` +
      `${donations.length} doações, ${transfers.length} repasse(s), ${requests.length} pedidos.`,
  );
  console.log("Login em /login — senha para todos: " + DEMO_PASSWORD);
  demoUsers.forEach((u) => console.log(`  ${u.role.padEnd(11)} ${u.email}`));

  return uids;
}

seed().then(() => process.exit(0));
