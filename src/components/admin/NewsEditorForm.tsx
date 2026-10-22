"use client";

import type { NewsArticle } from "@/lib/types/domain";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary";
const LABEL = "block text-[12.5px] font-semibold text-muted";

export function NewsEditorForm({ article }: { article: NewsArticle | null }) {
  const router = useRouter();
  const [values, setValues] = useState({
    titulo: article?.titulo ?? "",
    resumo: article?.resumo ?? "",
    corpo: article?.corpo ?? "",
    imageUrl: article?.imageUrl ?? "",
    imageAlt: article?.imageAlt ?? "",
    dataPublicacao: article?.dataPublicacao ?? new Date().toISOString().slice(0, 10),
    status: article?.status ?? "rascunho",
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function update(key: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    setError(null);
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/site-media", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Não foi possível enviar a imagem.");
        return;
      }
      update("imageUrl", result.url);
    } catch {
      setError("Falha de conexão ao enviar a imagem.");
    } finally {
      setBusy(null);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy("save");
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(article ? `/api/admin/noticias/${article.id}` : "/api/admin/noticias", {
        method: article ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Não foi possível salvar.");
        return;
      }
      if (!article) {
        router.replace(`/admin/noticias/${result.id}`);
        return;
      }
      setMessage(values.status === "publicado" ? "Notícia salva e publicada." : "Rascunho salvo.");
      router.refresh();
    } catch {
      setError("Falha de conexão ao salvar.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!article) return;
    setBusy("delete");
    setError(null);
    try {
      const response = await fetch(`/api/admin/noticias/${article.id}`, { method: "DELETE" });
      if (!response.ok) {
        setError((await response.json()).error ?? "Não foi possível excluir.");
        return;
      }
      router.replace("/admin/noticias");
      router.refresh();
    } catch {
      setError("Falha de conexão ao excluir.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <label className={LABEL}>
        Título
        <input required maxLength={160} value={values.titulo} onChange={(e) => update("titulo", e.target.value)} className={INPUT} />
      </label>
      <label className={LABEL}>
        Resumo (aparece na lista)
        <textarea required maxLength={400} value={values.resumo} onChange={(e) => update("resumo", e.target.value)} className={`${INPUT} min-h-[70px] resize-y`} />
      </label>
      <label className={LABEL}>
        Texto da matéria (separe parágrafos com uma linha em branco)
        <textarea required maxLength={20000} value={values.corpo} onChange={(e) => update("corpo", e.target.value)} className={`${INPUT} min-h-[260px] resize-y`} />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={LABEL}>
          Data de publicação
          <input type="date" required value={values.dataPublicacao} onChange={(e) => update("dataPublicacao", e.target.value)} className={INPUT} />
        </label>
        <label className={LABEL}>
          Situação
          <select value={values.status} onChange={(e) => update("status", e.target.value)} className={INPUT}>
            <option value="rascunho">Rascunho (não aparece no site)</option>
            <option value="publicado">Publicada</option>
          </select>
        </label>
      </div>
      <fieldset className="rounded-2xl border border-border bg-white p-4">
        <legend className="px-1 text-[12.5px] font-semibold text-muted">Imagem de capa (opcional)</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={LABEL}>
            Enviar imagem
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={busy === "upload"}
              onChange={(event) => {
                void uploadImage(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
              className={INPUT}
            />
          </label>
          <label className={LABEL}>
            Descrição acessível da imagem
            <input maxLength={300} value={values.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} className={INPUT} />
          </label>
        </div>
        {values.imageUrl && (
          <div className="mt-3 flex items-center gap-3">
            <Image src={values.imageUrl} alt={values.imageAlt} width={320} height={180} className="h-28 w-48 rounded-lg border border-border object-cover" />
            <button type="button" onClick={() => update("imageUrl", "")} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">
              Remover imagem
            </button>
          </div>
        )}
      </fieldset>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-[0_12px_24px_rgba(25,51,39,.08)]">
        <button type="submit" disabled={!!busy} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {busy === "save" ? "Salvando…" : "Salvar"}
        </button>
        {article && (
          confirmDelete ? (
            <>
              <button type="button" disabled={!!busy} onClick={remove} className="rounded-xl bg-urgent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {busy === "delete" ? "Excluindo…" : "Confirmar exclusão"}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="text-sm text-muted underline">
                Cancelar
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-xl border border-[#F2CBB5] px-4 py-2.5 text-sm font-semibold text-urgent">
              Excluir
            </button>
          )
        )}
        {busy === "upload" && <span role="status" className="text-[13px] text-muted">Enviando imagem…</span>}
        {message && <span role="status" className="text-[13px] text-primary">{message}</span>}
        {error && <span role="alert" className="text-[13px] text-urgent">{error}</span>}
      </div>
    </form>
  );
}
