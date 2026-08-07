/* eslint-disable no-console */
const fs = require("fs/promises");
const path = require("path");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "corrente-de-apoio";
const PASSWORD = process.env.DEMO_PASSWORD || "senha123";
const REPORT_PATH = path.resolve(
  "docs/relatorio-final-conformidade-fluxos.md",
);

const USERS = {
  requerente: "requerente@corrente.dev",
  curador: "curadoria@corrente.dev",
  financeiro: "financeiro@corrente.dev",
  admin: "admin@corrente.dev",
};

function nowIso() {
  return new Date().toISOString();
}

function resultLine(ok, label, details = "") {
  return { ok, label, details };
}

async function signInAndCreateSession(email, password) {
  const signInRes = await fetch(
    `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  const signInData = await signInRes.json();
  if (!signInRes.ok) {
    throw new Error(`Falha no login emulador (${email}): ${JSON.stringify(signInData)}`);
  }

  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: signInData.idToken }),
  });

  if (!sessionRes.ok) {
    const body = await sessionRes.text();
    throw new Error(`Falha ao criar sessao (${email}): ${sessionRes.status} ${body}`);
  }

  const setCookie = sessionRes.headers.get("set-cookie");
  if (setCookie) {
    return setCookie.split(";")[0];
  }

  return `idToken=${signInData.idToken}`;
}

async function fetchWithCookie(url, cookie, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Cookie", cookie);
  return fetch(url, { ...options, headers, redirect: "manual" });
}

async function main() {
  if (!getApps().length) initializeApp({ projectId: PROJECT_ID });
  const db = getFirestore();

  const results = [];

  const cookies = {};
  for (const [role, email] of Object.entries(USERS)) {
    try {
      cookies[role] = await signInAndCreateSession(email, PASSWORD);
      results.push(resultLine(true, `Sessao autenticada: ${role}`, email));
    } catch (error) {
      results.push(resultLine(false, `Sessao autenticada: ${role}`, String(error)));
    }
  }

  if (!cookies.requerente || !cookies.curador || !cookies.financeiro || !cookies.admin) {
    throw new Error("Nao foi possivel autenticar todos os papeis para executar o E2E.");
  }

  const pages = [
    { role: "requerente", path: "/meus-pedidos", expected: 200 },
    { role: "requerente", path: "/curadoria", expected: 307 },
    { role: "curador", path: "/curadoria", expected: 200 },
    { role: "curador", path: "/financeiro", expected: 307 },
    { role: "financeiro", path: "/financeiro", expected: 200 },
    { role: "financeiro", path: "/curadoria", expected: 307 },
    { role: "admin", path: "/admin/usuarios", expected: 200 },
    { role: "admin", path: "/admin/atendimentos", expected: 200 },
  ];

  for (const test of pages) {
    const res = await fetchWithCookie(`${BASE_URL}${test.path}`, cookies[test.role]);
    const ok = res.status === test.expected;
    const location = res.headers.get("location") || "";
    results.push(
      resultLine(
        ok,
        `Pagina ${test.path} como ${test.role}`,
        `status=${res.status}${location ? ` location=${location}` : ""}`,
      ),
    );
  }

  const queueSnap = await db
    .collection("requests")
    .where("status", "in", ["submetido", "em_analise", "em_alinhamento"])
    .limit(1)
    .get();
  let requestId = queueSnap.empty ? null : queueSnap.docs[0].id;

  const campaignSnap = await db
    .collection("campaigns")
    .where("status", "in", ["meta_atingida", "prazo_encerrado", "repasse_pendente"])
    .limit(1)
    .get();
  let campaignId = campaignSnap.empty ? null : campaignSnap.docs[0].id;

  if (!campaignId) {
    const anyCampaignSnap = await db.collection("campaigns").limit(1).get();
    campaignId = anyCampaignSnap.empty ? null : anyCampaignSnap.docs[0].id;
  }

  const pedidoForm = new FormData();
  pedidoForm.set("titulo", `E2E pedido ${Date.now()}`);
  pedidoForm.set("categoria", "Saude");
  pedidoForm.set("urgente", "false");
  pedidoForm.set("meta", "1500");
  pedidoForm.set("descricao", "Pedido de validacao E2E por papel.");
  pedidoForm.set("consentimentoLgpd", "true");

  const pedidoRes = await fetchWithCookie(`${BASE_URL}/api/pedidos`, cookies.requerente, {
    method: "POST",
    body: pedidoForm,
  });
  const pedidoJson = await pedidoRes.json().catch(() => ({}));
  results.push(
    resultLine(
      pedidoRes.ok,
      "API /api/pedidos como requerente",
      `status=${pedidoRes.status} id=${pedidoJson.id || "-"}`,
    ),
  );
  if (pedidoRes.ok && pedidoJson.id) requestId = pedidoJson.id;

  if (requestId) {
    const denyCuradoria = await fetchWithCookie(
      `${BASE_URL}/api/curadoria/${requestId}`,
      cookies.requerente,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "alinhar", mensagem: "teste" }),
      },
    );
    results.push(
      resultLine(
        denyCuradoria.status === 403,
        "API /api/curadoria/:id bloqueia requerente",
        `status=${denyCuradoria.status}`,
      ),
    );

    const curadoriaRes = await fetchWithCookie(
      `${BASE_URL}/api/curadoria/${requestId}`,
      cookies.curador,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "alinhar", mensagem: "Contato de validacao E2E" }),
      },
    );
    results.push(
      resultLine(
        curadoriaRes.ok,
        "API /api/curadoria/:id como curador",
        `status=${curadoriaRes.status}`,
      ),
    );
  } else {
    results.push(resultLine(false, "API /api/curadoria/:id", "Nenhum requestId disponivel."));
  }

  if (campaignId) {
    const financeForm = new FormData();
    financeForm.set("valor", "999");
    financeForm.set("data", new Date().toISOString().slice(0, 10));
    financeForm.set("comprovante", new Blob(["comprovante e2e"], { type: "text/plain" }), "e2e.txt");

    const financeiroRes = await fetchWithCookie(
      `${BASE_URL}/api/financeiro/${campaignId}`,
      cookies.financeiro,
      {
        method: "POST",
        body: financeForm,
      },
    );
    results.push(
      resultLine(
        financeiroRes.ok,
        "API /api/financeiro/:campaignId como financeiro",
        `status=${financeiroRes.status} campaignId=${campaignId}`,
      ),
    );
  } else {
    results.push(
      resultLine(false, "API /api/financeiro/:campaignId", "Nenhuma campanha disponivel para teste."),
    );
  }

  const adminCreatePayload = {
    nome: `E2E Usuario ${Date.now()}`,
    email: `e2e.${Date.now()}@redesol.dev`,
    role: "requerente",
  };
  const adminCreateRes = await fetchWithCookie(`${BASE_URL}/api/admin/usuarios`, cookies.admin, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adminCreatePayload),
  });
  const adminCreateJson = await adminCreateRes.json().catch(() => ({}));
  results.push(
    resultLine(
      adminCreateRes.ok,
      "API /api/admin/usuarios como admin",
      `status=${adminCreateRes.status} uid=${adminCreateJson.uid || "-"}`,
    ),
  );

  const curadorCreateRes = await fetchWithCookie(`${BASE_URL}/api/admin/usuarios`, cookies.curador, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Nao pode", email: "nao-pode@redesol.dev", role: "admin" }),
  });
  results.push(
    resultLine(
      curadorCreateRes.status === 403,
      "API /api/admin/usuarios bloqueia curador",
      `status=${curadorCreateRes.status}`,
    ),
  );

  const assistantRes = await fetch(`${BASE_URL}/api/assistente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Como faco para doar?" }),
  });
  results.push(
    resultLine(
      assistantRes.ok,
      "API /api/assistente publica",
      `status=${assistantRes.status}`,
    ),
  );

  const pass = results.filter((item) => item.ok).length;
  const fail = results.length - pass;

  const lines = [];
  lines.push("# Relatorio final de conformidade por fluxo (E2E)");
  lines.push("");
  lines.push(`- Data: ${nowIso()}`);
  lines.push(`- Base URL: ${BASE_URL}`);
  lines.push(`- Resultado geral: ${pass}/${results.length} testes aprovados`);
  lines.push(`- Falhas: ${fail}`);
  lines.push("");
  lines.push("## Evidencias");
  lines.push("");
  for (const item of results) {
    lines.push(`- ${item.ok ? "PASS" : "FAIL"} | ${item.label} | ${item.details}`);
  }

  lines.push("");
  lines.push("## Conclusao");
  if (fail === 0) {
    lines.push("- Todos os fluxos criticos testados passaram no E2E autenticado por papel.");
  } else {
    lines.push("- Ha falhas a tratar antes de considerar conformidade total.");
    lines.push("- Ver itens com FAIL na secao de evidencias.");
  }

  await fs.writeFile(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");

  console.log(`PASS: ${pass}`);
  console.log(`FAIL: ${fail}`);
  console.log(`Relatorio: ${REPORT_PATH}`);

  if (fail > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
