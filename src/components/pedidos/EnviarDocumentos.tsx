"use client";

import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/storage/limits";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnviarDocumentos({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOk(false);
    if (files.reduce((sum, f) => sum + f.size, 0) > MAX_UPLOAD_BYTES) {
      setError(`O total não pode passar de ${MAX_UPLOAD_LABEL}.`);
      return;
    }
    setBusy(true);
    const form = event.currentTarget;
    try {
      const data = new FormData();
      files.forEach((file) => data.append("anexos", file));
      const response = await fetch(`/api/pedidos/${requestId}/anexos`, { method: "POST", body: data });
      if (!response.ok) {
        setError((await response.json()).error ?? "Não foi possível enviar.");
        return;
      }
      form.reset();
      setFiles([]);
      setOk(true);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-wrap items-end gap-3">
      <label className="flex-1 text-[12.5px] font-semibold text-muted">
        Enviar mais documentos (até {MAX_UPLOAD_LABEL} por vez)
        <input
          type="file"
          multiple
          required
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="mt-1 block w-full rounded-lg border border-dashed border-border bg-bg px-3 py-2.5 text-[12.5px]"
        />
      </label>
      <button type="submit" disabled={busy} className="rounded-[10px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60">
        {busy ? "Enviando…" : "Enviar"}
      </button>
      {error && <p role="alert" className="w-full text-[13px] text-urgent">{error}</p>}
      {ok && <p role="status" className="w-full text-[13px] text-primary">Documentos enviados.</p>}
    </form>
  );
}
