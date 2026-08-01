import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Campaign, CampaignStatus } from "@/lib/types/domain";

const PUBLIC_STATUSES: CampaignStatus[] = [
  "publicado",
  "meta_atingida",
  "prestacao_publicada",
];

// Uma campanha permanece com página própria visível durante todo o ciclo
// depois de publicada, mesmo em estágios de repasse ainda não divulgados no portal.
const VISIBLE_ON_DETAIL_STATUSES: CampaignStatus[] = [
  "publicado",
  "meta_atingida",
  "prazo_encerrado",
  "repasse_pendente",
  "repassado",
  "prestacao_publicada",
  "encerrado",
];

export async function getPublicCampaigns(): Promise<Campaign[]> {
  const snapshot = await getAdminDb()
    .collection("campaigns")
    .where("status", "in", PUBLIC_STATUSES)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Campaign)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export async function getCampaignByRequestId(requestId: string): Promise<Campaign | null> {
  const snapshot = await getAdminDb()
    .collection("campaigns")
    .where("requestId", "==", requestId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Campaign;
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const snapshot = await getAdminDb()
    .collection("campaigns")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const campaign = { id: doc.id, ...doc.data() } as Campaign;

  if (!VISIBLE_ON_DETAIL_STATUSES.includes(campaign.status)) return null;

  return campaign;
}
