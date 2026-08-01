import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Role } from "@/lib/types/domain";

export interface AppUser {
  uid: string;
  nome: string;
  email: string;
  role: Role;
  idioma: string;
}

export async function listUsers(): Promise<AppUser[]> {
  const snapshot = await getAdminDb().collection("users").get();
  return snapshot.docs
    .map((doc) => ({ uid: doc.id, ...doc.data() }) as AppUser)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}
