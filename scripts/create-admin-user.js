// Cria (ou atualiza) um usuario no Auth + Firestore com papel "admin" (padrao) ou
// outro papel informado em --role.
//
// Uso:
//   node scripts/create-admin-user.js --target=production --email=x@y.com --password=Senha123 --nome="Nome"
//   node scripts/create-admin-user.js --target=production --role=assistente_social --email=... --password=... --nome="..."
//   node scripts/create-admin-user.js --target=emulator --email=x@y.com --password=Senha123 --nome="Nome"
//
// target=production le a service account de .env.production.local.
// target=emulator exige FIRESTORE_EMULATOR_HOST e FIREBASE_AUTH_EMULATOR_HOST no ambiente.

const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const ROLES = ["requerente", "curador", "assistente_social", "financeiro", "editor_conteudo", "admin"];

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, ...rest] = arg.replace(/^--/, "").split("=");
      return [key, rest.join("=") || true];
    }),
  );
  return { target: args.target, email: args.email, password: args.password, nome: args.nome, role: args.role || "admin" };
}

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

async function main() {
  const { target, email, password, nome, role } = parseArgs();
  if (!ROLES.includes(role)) {
    console.error(`--role precisa ser um de: ${ROLES.join(", ")}.`);
    process.exit(1);
  }
  if (!target || !email || !password || !nome) {
    console.error(
      'Uso: node scripts/create-admin-user.js --target=production|emulator --email=x@y.com --password=Senha123 --nome="Nome"',
    );
    process.exit(1);
  }

  let app;
  if (target === "production") {
    loadProductionEnvFile();
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" || !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY nao encontrada para producao. Aborta.");
      process.exit(1);
    }
    app = initializeApp(
      { credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) },
      "create-admin-production",
    );
  } else if (target === "emulator") {
    if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      console.error("FIRESTORE_EMULATOR_HOST e FIREBASE_AUTH_EMULATOR_HOST precisam estar setados.");
      process.exit(1);
    }
    app = initializeApp(
      { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "corrente-de-apoio" },
      "create-admin-emulator",
    );
  } else {
    console.error('--target precisa ser "production" ou "emulator".');
    process.exit(1);
  }

  const auth = getAuth(app);
  const db = getFirestore(app);

  let userRecord = await auth.getUserByEmail(email).catch(() => null);
  if (userRecord) {
    userRecord = await auth.updateUser(userRecord.uid, { password, displayName: nome });
    console.log(`Usuario existente atualizado (uid ${userRecord.uid}).`);
  } else {
    userRecord = await auth.createUser({ email, password, displayName: nome, emailVerified: true });
    console.log(`Usuario criado (uid ${userRecord.uid}).`);
  }

  await auth.setCustomUserClaims(userRecord.uid, { role, name: nome });
  await db.collection("users").doc(userRecord.uid).set({ nome, email, role, idioma: "pt" });

  console.log(`Papel "${role}" garantido para ${email} em [${target}].`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
