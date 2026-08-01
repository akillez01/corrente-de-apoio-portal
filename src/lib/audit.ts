import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";

export async function appendAuditLog(entry: {
  tipo: string;
  ator: string;
  alvo?: string;
  detalhes?: Record<string, unknown>;
}) {
  await getAdminDb()
    .collection("audit_log")
    .add({ ...entry, timestamp: new Date().toISOString() });
}
