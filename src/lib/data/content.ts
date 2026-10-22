import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Locale } from "@/lib/i18n/config";
import { getPageCopyDefaults, type PublicPageCopy, type PublicPageId } from "@/lib/types/siteContent";

function docId(pageId: PublicPageId, locale: Locale) {
  return `site_content/public_${pageId}_${locale}`;
}

export async function getPublicPageCopy(
  pageId: PublicPageId,
  locale: Locale,
): Promise<PublicPageCopy> {
  const defaults = getPageCopyDefaults(pageId, locale);
  const snapshot = await getAdminDb().doc(docId(pageId, locale)).get();
  if (!snapshot.exists) return defaults;
  const stored = snapshot.data();
  if (!stored || typeof stored.copy !== "object" || stored.copy === null || Array.isArray(stored.copy)) {
    return defaults;
  }
  // Campos removidos dos padrões (ex.: após reorganizar uma página) são ignorados,
  // para não reaparecerem no editor nem invalidarem o próximo salvamento.
  const overrides: PublicPageCopy = {};
  for (const [key, value] of Object.entries(stored.copy)) {
    if (typeof value === "string" && key in defaults) overrides[key] = value;
  }
  return { ...defaults, ...overrides };
}

export async function savePublicPageCopy(
  pageId: PublicPageId,
  locale: Locale,
  copy: PublicPageCopy,
  actor: string,
): Promise<void> {
  const db = getAdminDb();
  const contentRef = db.doc(docId(pageId, locale));
  const auditRef = db.collection("audit_log").doc();
  const now = new Date().toISOString();
  await db.runTransaction(async (transaction) => {
    transaction.set(contentRef, { pageId, locale, copy, updatedAt: now });
    transaction.create(auditRef, {
      tipo: "conteudo_site_atualizado",
      ator: actor,
      alvo: `site_content/public_${pageId}_${locale}`,
      timestamp: now,
    });
  });
}
