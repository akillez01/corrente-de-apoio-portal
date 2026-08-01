"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types/domain";

const ROLES: Role[] = ["requerente", "curador", "financeiro", "admin"];

export function CreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("curador");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; senha: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar o usuário.");
        return;
      }
      setCreated({ email, senha: data.senhaTemporaria });
      setNome("");
      setEmail("");
      setRole("curador");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 rounded-[10px] bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-dark"
      >
        + Criar usuário
      </button>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-border bg-white p-4.5">
      <h2 className="mb-3 text-sm font-semibold">Criar usuário</h2>

      {created ? (
        <div className="rounded-xl border border-border bg-bg p-3.5 text-[13px]">
          <p className="mb-2">
            Conta criada para <span className="font-mono">{created.email}</span>. Repasse a senha
            abaixo — ela não será mostrada de novo:
          </p>
          <p className="mb-3 rounded-lg bg-white px-3 py-2 font-mono text-[13px]">
            {created.senha}
          </p>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setOpen(false);
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] hover:border-primary"
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wider text-muted">Nome</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wider text-muted">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wider text-muted">Papel</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-lg border border-border bg-white px-2.5 py-2 text-[13px] outline-none focus:border-primary"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-[10px] bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "Criando…" : "Criar"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-[10px] border border-border px-4 py-2 text-[13px] hover:border-primary"
          >
            Cancelar
          </button>
          {error && <p className="w-full text-[12px] text-urgent">{error}</p>}
        </form>
      )}
    </div>
  );
}
