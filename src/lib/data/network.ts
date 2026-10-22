import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { CommunityProject, DaimePoint, ModerationStatus } from "@/lib/types/domain";

export const PROJECTS_COLLECTION = "projetos";
export const POINTS_COLLECTION = "pontos";

export async function getProjectsByStatus(status: ModerationStatus): Promise<CommunityProject[]> {
  const snapshot = await getAdminDb().collection(PROJECTS_COLLECTION).where("status", "==", status).get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as CommunityProject)
    .sort((a, b) => (b.publicadoEm ?? b.criadoEm).localeCompare(a.publicadoEm ?? a.criadoEm));
}

export async function getApprovedProjectBySlug(slug: string): Promise<CommunityProject | null> {
  const snapshot = await getAdminDb()
    .collection(PROJECTS_COLLECTION)
    .where("slug", "==", slug)
    .where("status", "==", "aprovado")
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as CommunityProject;
}

export async function getPointsByStatus(status: ModerationStatus): Promise<DaimePoint[]> {
  const snapshot = await getAdminDb().collection(POINTS_COLLECTION).where("status", "==", status).get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as DaimePoint)
    .sort((a, b) =>
      `${a.pais}|${a.estado ?? ""}|${a.municipio}|${a.nome}`.localeCompare(
        `${b.pais}|${b.estado ?? ""}|${b.municipio}|${b.nome}`,
        "pt-BR",
      ),
    );
}
