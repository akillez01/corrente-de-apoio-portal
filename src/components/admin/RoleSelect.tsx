"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types/domain";

const ROLES: Role[] = ["requerente", "curador", "financeiro", "admin"];

export function RoleSelect({
  uid,
  role,
  disabled,
}: {
  uid: string;
  role: Role;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(newRole: Role) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Não foi possível alterar o papel.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <select
        value={role}
        disabled={disabled || loading}
        onChange={(e) => handleChange(e.target.value as Role)}
        className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary disabled:opacity-60"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] text-urgent">{error}</p>}
    </div>
  );
}
