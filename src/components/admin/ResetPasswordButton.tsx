"use client";

import { useState } from "react";

export function ResetPasswordButton({
  uid,
  nome,
  disabled,
}: {
  uid: string;
  nome: string;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [senha, setSenha] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (disabled) return null;

  async function handleReset() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${uid}/senha`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível redefinir a senha.");
        return;
      }
      setSenha(data.senhaTemporaria);
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  async function handleCopy() {
    if (!senha) return;
    try {
      await navigator.clipboard.writeText(senha);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (senha) {
    return (
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-bg p-2 text-[11.5px]">
        <span>Nova senha de {nome} (não será mostrada de novo):</span>
        <span className="rounded bg-white px-2 py-1 font-mono text-[12.5px]">{senha}</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-border px-2 py-1 hover:border-primary"
          >
            {copied ? "Copiada" : "Copiar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSenha(null);
              setCopied(false);
            }}
            className="rounded-lg border border-border px-2 py-1 hover:border-primary"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted">Redefinir senha de {nome}?</span>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="rounded-lg bg-primary px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Gerando..." : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-lg border border-border px-2 py-1 text-[11px] text-muted"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-border px-2.5 py-1.5 text-[12px] font-semibold hover:border-primary"
      >
        Redefinir senha
      </button>
      {error && <p className="mt-1 text-[11px] text-urgent">{error}</p>}
    </div>
  );
}
