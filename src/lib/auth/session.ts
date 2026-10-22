import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "@/lib/firebase/admin";
import type { Role } from "@/lib/types/domain";

const SESSION_COOKIE = "idToken";

export interface SessionUser {
  uid: string;
  email: string | null;
  nome: string | null;
  role: Role | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      nome: (decoded.name as string | undefined) ?? null,
      role: (decoded.role as Role | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.role || !roles.includes(user.role)) redirect("/login?erro=acesso-negado");
  return user;
}

export { SESSION_COOKIE };
