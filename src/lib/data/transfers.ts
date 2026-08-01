import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Transfer } from "@/lib/types/domain";

export async function getTransferForCampaign(campaignId: string): Promise<Transfer | null> {
  const snapshot = await getAdminDb()
    .collection("transfers")
    .where("campaignId", "==", campaignId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Transfer;
}
