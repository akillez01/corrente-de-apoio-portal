import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { NewsArticle } from "@/lib/types/domain";

export const NEWS_COLLECTION = "noticias";

function byDateDesc(a: NewsArticle, b: NewsArticle) {
  return b.dataPublicacao.localeCompare(a.dataPublicacao) || b.criadoEm.localeCompare(a.criadoEm);
}

export async function getPublishedNews(): Promise<NewsArticle[]> {
  const snapshot = await getAdminDb().collection(NEWS_COLLECTION).where("status", "==", "publicado").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as NewsArticle).sort(byDateDesc);
}

export async function getAllNews(): Promise<NewsArticle[]> {
  const snapshot = await getAdminDb().collection(NEWS_COLLECTION).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as NewsArticle).sort(byDateDesc);
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  const doc = await getAdminDb().collection(NEWS_COLLECTION).doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as NewsArticle) : null;
}

export async function getPublishedNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const snapshot = await getAdminDb()
    .collection(NEWS_COLLECTION)
    .where("slug", "==", slug)
    .where("status", "==", "publicado")
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as NewsArticle;
}
