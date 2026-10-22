import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { SocialCase } from "@/lib/types/domain";

export const SOCIAL_CASES_COLLECTION = "atendimentos_sociais";

export async function getSocialCase(requestId: string): Promise<SocialCase | null> {
  const doc = await getAdminDb().collection(SOCIAL_CASES_COLLECTION).doc(requestId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as SocialCase;
}

export interface SocialCaseSummary {
  status: SocialCase["status"];
  resultado: string | null;
  encerradoEm: string | null;
}

// Situação de cada prontuário para as listas (lê só status e desfecho).
export async function getSocialCaseSummaries(): Promise<Map<string, SocialCaseSummary>> {
  const snapshot = await getAdminDb()
    .collection(SOCIAL_CASES_COLLECTION)
    .select("status", "encerramento.resultado", "encerramento.data")
    .get();
  return new Map(
    snapshot.docs.map((doc) => [
      doc.id,
      {
        status: doc.get("status") as SocialCase["status"],
        resultado: (doc.get("encerramento.resultado") as string | undefined) ?? null,
        encerradoEm: (doc.get("encerramento.data") as string | undefined) ?? null,
      },
    ]),
  );
}
