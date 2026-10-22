import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { RequestStatus, SupportRequest } from "@/lib/types/domain";
import { PRIORIDADE_ORDEM } from "@/lib/domain/prioridade";

// Avaliação do Serviço Social quando existe; senão, a marcação de urgência do cadastro.
function priorityRank(request: SupportRequest): number {
  return PRIORIDADE_ORDEM[request.prioridadeSocial?.nivel ?? (request.urgente ? "urgente" : "normal")];
}

const QUEUE_STATUSES: RequestStatus[] = ["submetido", "em_analise", "em_alinhamento"];

export async function getRequestsQueue(): Promise<SupportRequest[]> {
  const snapshot = await getAdminDb()
    .collection("requests")
    .where("status", "in", QUEUE_STATUSES)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as SupportRequest)
    .sort((a, b) => {
      // Casos já avaliados e encaminhados pelo Serviço Social vêm primeiro.
      if (!!a.encaminhamentoCampanha !== !!b.encaminhamentoCampanha) return a.encaminhamentoCampanha ? -1 : 1;
      if (priorityRank(a) !== priorityRank(b)) return priorityRank(a) - priorityRank(b);
      return a.criadoEm.localeCompare(b.criadoEm);
    });
}

export async function getRequestById(id: string): Promise<SupportRequest | null> {
  const doc = await getAdminDb().collection("requests").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as SupportRequest;
}

export async function getRequestsByRequerente(requerenteId: string): Promise<SupportRequest[]> {
  const snapshot = await getAdminDb()
    .collection("requests")
    .where("requerenteId", "==", requerenteId)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as SupportRequest)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

// Fila do Serviço Social: todos os cadastros não arquivados, urgentes primeiro.
export async function getRequestsForSocialWork(): Promise<SupportRequest[]> {
  const snapshot = await getAdminDb().collection("requests").get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as SupportRequest)
    .filter((request) => request.status !== "arquivado")
    .sort((a, b) => {
      if (priorityRank(a) !== priorityRank(b)) return priorityRank(a) - priorityRank(b);
      return b.criadoEm.localeCompare(a.criadoEm);
    });
}
