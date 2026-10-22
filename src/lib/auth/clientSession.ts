"use client";

import type { Role } from "@/lib/types/domain";
import type { User } from "firebase/auth";

// Envia o idToken pro backend, que provisiona papel "requerente" no primeiro
// login (ex: cadastro via Google ou pelo formulário de acolhimento). Nesse caso o
// idToken já em mãos ainda não carrega o custom claim novo, então força um refresh
// e reenvia antes de seguir.
export async function establishSession(user: User): Promise<Role | undefined> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Não foi possível criar a sessão.");
  const { provisioned } = await res.json();

  let tokenResult = await user.getIdTokenResult();
  if (provisioned) {
    const freshIdToken = await user.getIdToken(true);
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: freshIdToken }),
    });
    tokenResult = await user.getIdTokenResult(true);
  }

  return tokenResult.claims.role as Role | undefined;
}
