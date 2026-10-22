import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { RequestStatus, SupportRequest } from "@/lib/types/domain";


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


// Campos usados nas listas dos painéis. Relato, módulos 2–3, anexos e mensagens ficam de fora:
// só são lidos ao abrir um caso, o que deixa as listas leves mesmo com muitos cadastros.
const LIST_FIELDS = [
  "requerenteNome",
  "identificacao",
  "titulo",
  "categoria",
  "categorias",
  "urgente",
  "prioridadeSocial",
  "encaminhamentoCampanha",
  "meta",
  "status",
  "criadoEm",
  "atualizadoEm",
] as const;

export type RequestSummary = Pick<SupportRequest, "id" | (typeof LIST_FIELDS)[number]>;

// Lista para painéis. Com `desde`, o recorte por data é feito no próprio Firestore.
export async function getRequestSummaries(options: { desde?: string; statuses?: RequestStatus[] } = {}) {
  let query: FirebaseFirestore.Query = getAdminDb().collection("requests");
  if (options.statuses) query = query.where("status", "in", options.statuses);
  else if (options.desde) query = query.where("criadoEm", ">=", options.desde);
  const snapshot = await query.select(...LIST_FIELDS).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as RequestSummary);
}
