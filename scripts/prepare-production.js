// Prepara o Firestore/Auth de PRODUCAO para o primeiro uso real:
//   1. Remove qualquer conta de demonstracao (dominio @corrente.dev, os mesmos
//      usuarios criados por scripts/seed-emulator.js).
//   2. Remove documentos de campanhas/doacoes/repasses/pedidos que porventura
//      tenham sido criados de teste (nao mexe em nada que nao bata com os ids
//      de exemplo nem em dados de dominios diferentes de @corrente.dev).
//   3. Garante que o e-mail informado exista no Auth com papel "admin".
//
// Por padrao roda em modo DRY-RUN (so mostra o que faria). Para aplicar de
// verdade, passe --confirm.
//
// Uso:
//   FIREBASE_SERVICE_ACCOUNT_KEY='...' node scripts/prepare-production.js \
//     --admin-email=voce@dominio.org --admin-nome="Seu Nome" [--confirm]

const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

// Carrega .env.production.local sem passar pelo shell (evita o bash tratar
// as aspas do JSON da service account como quoting e corromper o valor).
function loadProductionEnvFile() {
  const envPath = path.resolve(__dirname, "..", ".env.production.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const DEMO_EMAIL_DOMAIN = "@corrente.dev";
const DEMO_CAMPAIGN_IDS = ["cirurgia-rafael", "casa-dona-marta", "cadeira-seu-elias", "reforma-capela"];
const DEMO_DONATION_IDS = ["doa-1", "doa-2", "doa-3", "doa-4"];
const DEMO_TRANSFER_IDS = ["rep-cadeira-seu-elias"];
const DEMO_REQUEST_IDS = [
  "req-cadeira-banho",
  "req-material-escolar",
  "req-tratamento-dentario",
  "req-conserto-telhado",
];

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, ...rest] = arg.replace(/^--/, "").split("=");
      return [key, rest.join("=") || true];
    }),
  );
  return {
    confirm: Boolean(args.confirm),
    target: args.target || "production",
    adminEmail: args["admin-email"],
    adminNome: args["admin-nome"],
  };
}

function initApp(target) {
  if (target === "emulator") {
    if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      console.error("FIRESTORE_EMULATOR_HOST e FIREBASE_AUTH_EMULATOR_HOST precisam estar setados.");
      process.exit(1);
    }
    return initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "corrente-de-apoio" });
  }

  if (target !== "production") {
    console.error('--target precisa ser "production" ou "emulator".');
    process.exit(1);
  }

  loadProductionEnvFile();
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
    console.error(
      "NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true — este script e para o projeto de PRODUCAO. Aborta.",
    );
    process.exit(1);
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error(
      "FIREBASE_SERVICE_ACCOUNT_KEY nao definida. Exporte a chave de service account de producao antes de rodar.",
    );
    process.exit(1);
  }
  return initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
}

async function main() {
  const { confirm, target, adminEmail, adminNome } = parseArgs();
  if (!adminEmail || !adminNome) {
    console.error(
      'Uso: node scripts/prepare-production.js --target=production|emulator --admin-email=voce@dominio.org --admin-nome="Seu Nome" [--confirm]',
    );
    process.exit(1);
  }

  const app = initApp(target);
  const db = getFirestore(app);
  const auth = getAuth(app);

  console.log(confirm ? "MODO: aplicando alteracoes (--confirm)." : "MODO: dry-run (nada sera alterado).");
  console.log("");

  // 1) Contas de demonstracao no Auth + Firestore/users
  const demoAuthUsers = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const u of page.users) {
      if (u.email && u.email.endsWith(DEMO_EMAIL_DOMAIN)) demoAuthUsers.push(u);
    }
    pageToken = page.pageToken;
  } while (pageToken);

  console.log(`Contas de demonstracao encontradas (${DEMO_EMAIL_DOMAIN}): ${demoAuthUsers.length}`);
  demoAuthUsers.forEach((u) => console.log(`  - ${u.email} (${u.uid})`));
  if (confirm) {
    for (const u of demoAuthUsers) {
      await auth.deleteUser(u.uid);
      await db.collection("users").doc(u.uid).delete();
    }
  }

  // 2) Documentos de exemplo (campanhas/doacoes/repasses/pedidos)
  const demoDocs = [
    ["campaigns", DEMO_CAMPAIGN_IDS],
    ["donations", DEMO_DONATION_IDS],
    ["transfers", DEMO_TRANSFER_IDS],
    ["requests", DEMO_REQUEST_IDS],
  ];
  for (const [collection, ids] of demoDocs) {
    const existing = [];
    for (const id of ids) {
      const snap = await db.collection(collection).doc(id).get();
      if (snap.exists) existing.push(id);
    }
    console.log(`Documentos de exemplo em "${collection}": ${existing.length}/${ids.length}`);
    if (confirm) {
      for (const id of existing) await db.collection(collection).doc(id).delete();
    }
  }

  // 3) Garante o admin real
  console.log("");
  let adminUser = await auth.getUserByEmail(adminEmail).catch(() => null);
  if (!adminUser) {
    console.log(`Admin "${adminEmail}" nao existe no Auth ainda.`);
    if (confirm) {
      adminUser = await auth.createUser({ email: adminEmail, displayName: adminNome, emailVerified: true });
      console.log(
        `Conta criada (uid ${adminUser.uid}). Peca para essa pessoa usar "Esqueci minha senha" no /login para definir a senha.`,
      );
    }
  } else {
    console.log(`Admin "${adminEmail}" ja existe no Auth (uid ${adminUser.uid}).`);
  }
  if (confirm && adminUser) {
    await auth.setCustomUserClaims(adminUser.uid, { role: "admin", name: adminNome });
    await db.collection("users").doc(adminUser.uid).set({
      nome: adminNome,
      email: adminEmail,
      role: "admin",
      idioma: "pt",
    });
    console.log(`Papel "admin" garantido para ${adminEmail}.`);
  }

  console.log("");
  console.log(confirm ? "Concluido." : "Dry-run concluido. Rode novamente com --confirm para aplicar.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
