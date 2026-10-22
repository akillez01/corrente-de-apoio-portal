import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { SocialCase } from "@/lib/types/domain";

export const SOCIAL_CASES_COLLECTION = "atendimentos_sociais";

export async function getSocialCase(requestId: string): Promise<SocialCase | null> {
  const doc = await getAdminDb().collection(SOCIAL_CASES_COLLECTION).doc(requestId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as SocialCase;
}

export async function getSocialCaseStatuses(): Promise<Map<string, SocialCase["status"]>> {
  const snapshot = await getAdminDb().collection(SOCIAL_CASES_COLLECTION).select("status").get();
  return new Map(snapshot.docs.map((doc) => [doc.id, doc.get("status") as SocialCase["status"]]));
}
