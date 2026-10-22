// Ajusta o conteúdo do site já salvo no Firestore (coleção site_content) para a
// reorganização do portal de out/2026:
//   1. Troca "Daime Integração" por "Daime Solidariedade" em todos os textos salvos.
//   2. Remove das páginas os textos que o cliente pediu para mudar, para que os
//      novos textos padrão (src/lib/types/siteContent.ts) passem a valer. Campos
//      que deixaram de existir já são ignorados pelo site e também são limpos aqui.
//
// Por padrão roda em modo DRY-RUN (só mostra o que faria). Para aplicar, passe --confirm.
//
// Uso:
//   node scripts/migrar-conteudo-reorganizacao.js            # lê .env.production.local
//   node scripts/migrar-conteudo-reorganizacao.js --confirm
//   (ou com FIRESTORE_EMULATOR_HOST=localhost:8085 para testar no emulador)

const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

function loadProductionEnvFile() {
  const envPath = path.resolve(__dirname, "..", ".env.production.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] === undefined) process.env[key] = trimmed.slice(eq + 1);
  }
}

// Campos cujo texto padrão mudou a pedido do cliente (por página).
const RESET_KEYS = {
  support: ["eyebrow", "title", "intro", "note"],
  volunteering: ["title", "subtitle", "howItWorksTitle", "step1", "step2", "step3"],
  projects: ["eyebrow", "title", "intro", "note"],
  transparency: ["eyebrow", "title", "intro", "note"],
  youth: ["eyebrow", "title", "intro", "note", "card3Title", "card3Text"],
  women: ["eyebrow", "title", "intro", "ctaLabel", "note"],
  campaigns: ["eyebrow", "title", "intro"],
};

// Campos que não existem mais nos padrões.
const STALE_KEYS = {
  global: ["supportLink", "volunteerLink", "campaignsLink", "projectsLink", "womenLink", "youthLink", "transparencyLink"],
  home: [
    "campaignsButton", "identityEyebrow", "identityTitle", "identityIntro", "joinNetwork",
    ...[1, 2, 3, 4, 5, 6].flatMap((n) => [`identity${n}Eyebrow`, `identity${n}Title`, `identity${n}Text`]),
  ],
  support: ["ctaLabel", "card1Title", "card1Text", "card2Title", "card2Text", "card3Title", "card3Text"],
  volunteering: [
    "badge", "qualifiedTitle", "qualifiedText1", "qualifiedText2", "ctaSignUp", "ctaSeeImpact", "step4",
    "priorityAreasTitle", "area1Title", "area1Text", "area2Title", "area2Text", "area3Title", "area3Text",
    "area4Title", "area4Text", "sustainBadge", "sustainTitle", "sustainText", "donateToSustain", "seeHowResourcesApplied",
  ],
  projects: ["ctaLabel", "card1Title", "card1Text", "card2Title", "card2Text", "card3Title", "card3Text"],
  transparency: ["ctaLabel", "card1Title", "card1Text", "card2Title", "card2Text", "card3Title", "card3Text"],
  about: ["note"],
};

async function main() {
  const confirm = process.argv.includes("--confirm");
  if (!process.env.FIRESTORE_EMULATOR_HOST) loadProductionEnvFile();
  const app = process.env.FIRESTORE_EMULATOR_HOST
    ? initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "corrente-de-apoio" })
    : initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
  const db = getFirestore(app);

  const snapshot = await db.collection("site_content").get();
  let changedDocs = 0;
  for (const doc of snapshot.docs) {
    const { pageId, copy } = doc.data();
    if (!copy || typeof copy !== "object") continue;
    const next = { ...copy };
    const changes = [];

    for (const [key, value] of Object.entries(next)) {
      if (typeof value === "string" && value.includes("Daime Integração")) {
        next[key] = value.replaceAll("Daime Integração", "Daime Solidariedade");
        changes.push(`  ${key}: "Daime Integração" → "Daime Solidariedade"`);
      }
    }
    for (const key of [...(RESET_KEYS[pageId] ?? []), ...(STALE_KEYS[pageId] ?? [])]) {
      if (key in next) {
        delete next[key];
        changes.push(`  ${key}: removido (passa a valer o texto padrão novo)`);
      }
    }

    if (changes.length === 0) continue;
    changedDocs += 1;
    console.log(`${doc.id}:\n${changes.join("\n")}`);
    if (confirm) {
      await doc.ref.update({ copy: next, updatedAt: new Date().toISOString() });
      await db.collection("audit_log").add({
        tipo: "conteudo_site_migrado",
        ator: "script migrar-conteudo-reorganizacao",
        alvo: `site_content/${doc.id}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  console.log(
    changedDocs === 0
      ? "Nada a migrar."
      : confirm
        ? `${changedDocs} documento(s) atualizado(s).`
        : `${changedDocs} documento(s) seriam atualizados. Rode com --confirm para aplicar.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
