import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Donation } from "@/lib/types/domain";

export async function getRecentDonations(campaignId: string, take = 4): Promise<Donation[]> {
  const snapshot = await getAdminDb()
    .collection("donations")
    .where("campaignId", "==", campaignId)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Donation)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .slice(0, take);
}
