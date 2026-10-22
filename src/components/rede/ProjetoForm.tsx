"use client";

import { APOIO_LABELS_EN, APOIOS_PROJETO } from "@/lib/domain/rede";
import type { Locale } from "@/lib/i18n/config";
import { useState } from "react";
import { HONEYPOT, INPUT, LABEL, SUBMIT } from "./formStyles";

const TEXT = {
  pt: {
    title: "Nome do projeto *",
    summary: "Resumo (aparece na lista, até 280 caracteres) *",
    description: "Descrição: objetivo, quem participa, o que já existe e o que falta *",
    place: "Comunidade / local *",
    support: "De que apoio o projeto precisa? *",
    link: "Site ou Instagram do projeto",
    responsible: "Responsável *",
    email: "E-mail do responsável *",
    phone: "Telefone / WhatsApp",
    privacy: "O e-mail e o telefone do responsável não são publicados; a equipe usa para conversar sobre o projeto.",
    consent: "Autorizo a publicação do nome, resumo, descrição e local do projeto no portal, após aprovação da equipe. *",
    submit: "Enviar projeto",
    sending: "Enviando…",
    errorSupport: "Marque pelo menos um tipo de apoio.",
    errorGeneric: "Não foi possível enviar o projeto.",
    success: "Projeto enviado! A equipe vai analisar e, quando aprovado, ele ganha uma página com link para divulgação.",
  },
  en: {
    title: "Project name *",
    summary: "Summary (shown on the list, up to 280 characters) *",
    description: "Description: goal, who takes part, what exists and what is missing *",
    place: "Community / place *",
    support: "What support does the project need? *",
    link: "Project website or Instagram",
    responsible: "Person responsible *",
    email: "Contact email *",
    phone: "Phone / WhatsApp",
    privacy: "The contact email and phone are not published; the team uses them to talk about the project.",
    consent: "I authorize publishing the project name, summary, description, and place on the portal after team approval. *",
    submit: "Submit project",
    sending: "Sending…",
    errorSupport: "Check at least one type of support.",
    errorGeneric: "Could not submit the project.",
    success: "Project submitted! The team will review it and, once approved, it gets a page with a shareable link.",
  },
} as const;

export function ProjetoForm({ locale }: { locale: Locale }) {
  const t = TEXT[locale] ?? TEXT.pt;
  const en = locale === "en";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const apoiosNecessarios = data.getAll("apoiosNecessarios");
    if (apoiosNecessarios.length === 0) {
      setError(t.errorSupport);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(data.entries()),
          apoiosNecessarios,
          consentimento: data.get("consentimento") === "sim",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? t.errorGeneric);
        return;
      }
      form.reset();
      setSuccess(true);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <p role="status" className="rounded-2xl border border-[#CFE3D6] bg-[#EFF7F1] p-5 text-sm text-[#1F4E39]">{t.success}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5">
      <label className={HONEYPOT} aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className={LABEL}>
        {t.title}
        <input name="titulo" required maxLength={120} className={INPUT} />
      </label>
      <label className={LABEL}>
        {t.summary}
        <textarea name="resumo" required maxLength={280} className={`${INPUT} min-h-[64px] resize-y`} />
      </label>
      <label className={LABEL}>
        {t.description}
        <textarea name="descricao" required maxLength={5000} className={`${INPUT} min-h-[140px] resize-y`} />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={LABEL}>
          {t.place}
          <input name="local" required maxLength={160} className={INPUT} />
        </label>
        <label className={LABEL}>
          {t.link}
          <input name="linkExterno" maxLength={300} placeholder="https://… ou @perfil" className={INPUT} />
        </label>
      </div>
      <p className={LABEL}>{t.support}</p>
      <div className="-mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {APOIOS_PROJETO.map((apoio) => (
          <label key={apoio} className="flex items-start gap-2 text-[13px] text-ink">
            <input name="apoiosNecessarios" type="checkbox" value={apoio} className="mt-0.5 accent-primary" />
            {en ? APOIO_LABELS_EN[apoio] : apoio}
          </label>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className={LABEL}>
          {t.responsible}
          <input name="responsavelNome" required maxLength={120} autoComplete="name" className={INPUT} />
        </label>
        <label className={LABEL}>
          {t.email}
          <input name="responsavelEmail" type="email" required maxLength={160} autoComplete="email" className={INPUT} />
        </label>
        <label className={LABEL}>
          {t.phone}
          <input name="responsavelTelefone" type="tel" maxLength={40} autoComplete="tel" className={INPUT} />
        </label>
      </div>
      <p className="text-xs text-muted">{t.privacy}</p>
      <label className="flex items-start gap-2.5 rounded-lg border border-border bg-bg p-3.5 text-[12.5px]">
        <input name="consentimento" type="checkbox" value="sim" required className="mt-0.5" />
        <span>{t.consent}</span>
      </label>
      {error && <p role="alert" className="text-[13px] text-urgent">{error}</p>}
      <button type="submit" disabled={loading} className={SUBMIT}>
        {loading ? t.sending : t.submit}
      </button>
    </form>
  );
}
