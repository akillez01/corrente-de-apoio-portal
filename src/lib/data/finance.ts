import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Campaign, CampaignStatus } from "@/lib/types/domain";

const FINANCE_STATUSES: CampaignStatus[] = [
  "meta_atingida",
  "prazo_encerrado",
  "repasse_pendente",
  "repassado",
  "prestacao_publicada",
];

export async function getCampaignsForFinance(): Promise<Campaign[]> {
  const snapshot = await getAdminDb()
    .collection("campaigns")
    .where("status", "in", FINANCE_STATUSES)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Campaign)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}
