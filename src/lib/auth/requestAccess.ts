import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import type { SupportRequest } from "@/lib/types/domain";

const TEAM_ROLES = ["curador", "assistente_social", "admin"];

// Quem pode ver e conversar sobre um pedido: a própria pessoa ou a equipe de atendimento.
export function requestAccess(user: SessionUser | null, request: SupportRequest): "requerente" | "equipe" | null {
  if (!user) return null;
  if (user.uid === request.requerenteId) return "requerente";
  if (user.role && TEAM_ROLES.includes(user.role)) return "equipe";
  return null;
}
