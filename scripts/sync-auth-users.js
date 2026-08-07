// Sincroniza usuários padrão entre Auth e Firestore no ambiente alvo.
// Uso local (emulador):
//   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/sync-auth-users.js
// Uso produção:
//   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}' NEXT_PUBLIC_FIREBASE_PROJECT_ID=corrente-de-apoio node scripts/sync-auth-users.js
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "corrente-de-apoio";
const DEFAULT_PASSWORD = process.env.DEMO_PASSWORD || "senha123";

const USERS = [
  { email: "curadoria@corrente.dev", nome: "Ana Meirelles", role: "curador" },
  { email: "financeiro@corrente.dev", nome: "Marcos D'Ávila", role: "financeiro" },
  { email: "admin@corrente.dev", nome: "Beatriz Nogueira", role: "admin" },
  { email: "requerente@corrente.dev", nome: "Joana Ribeiro", role: "requerente" },
];

function getAdminConfig() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    return {
      credential: cert(JSON.parse(serviceAccountJson)),
      projectId: PROJECT_ID,
    };
  }
  return { projectId: PROJECT_ID };
}

async function upsertUsers() {
  const app = initializeApp(getAdminConfig());
  const auth = getAuth(app);
  const db = getFirestore(app);

  for (const user of USERS) {
    let record;
    try {
      record = await auth.getUserByEmail(user.email);
      await auth.updateUser(record.uid, {
        displayName: user.nome,
        password: DEFAULT_PASSWORD,
      });
    } catch {
      record = await auth.createUser({
        email: user.email,
        displayName: user.nome,
        password: DEFAULT_PASSWORD,
      });
    }

    await auth.setCustomUserClaims(record.uid, { role: user.role, name: user.nome });
    await db.collection("users").doc(record.uid).set({
      nome: user.nome,
      email: user.email,
      role: user.role,
      idioma: "pt",
    });
  }

  const target = process.env.FIREBASE_AUTH_EMULATOR_HOST ? "localhost/emulador" : "producao";
  console.log(`Usuarios sincronizados em ${target} (projectId=${PROJECT_ID}).`);
  console.log(`Senha aplicada: ${DEFAULT_PASSWORD}`);
  USERS.forEach((u) => console.log(`  ${u.role.padEnd(11)} ${u.email}`));
}

upsertUsers().then(() => process.exit(0));
