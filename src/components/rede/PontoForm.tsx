"use client";

import type { Locale } from "@/lib/i18n/config";
import { useState } from "react";
import { HONEYPOT, INPUT, LABEL, SUBMIT } from "./formStyles";

const TEXT = {
  pt: {
    name: "Nome do ponto / igreja *",
    location: "Localização (endereço ou referência) *",
    city: "Município *",
    state: "Estado",
    country: "País *",
    contact: "Contato do acolhimento (nome e telefone ou e-mail) *",
    link: "Site ou perfil do Instagram",
    yourEmail: "Seu e-mail (não publicado, para a equipe confirmar o cadastro) *",
    consent: "Confirmo que o responsável pelo acolhimento autorizou a divulgação destes contatos no portal. *",
    submit: "Cadastrar ponto",
    sending: "Enviando…",
    errorGeneric: "Não foi possível enviar o cadastro.",
    success: "Ponto enviado! Ele aparece na lista depois da revisão da equipe.",
  },
  en: {
    name: "Point / church name *",
    location: "Location (address or landmark) *",
    city: "City *",
    state: "State",
    country: "Country *",
    contact: "Welcome contact (name and phone or email) *",
    link: "Website or Instagram profile",
    yourEmail: "Your email (not published, so the team can confirm) *",
    consent: "I confirm the person responsible for welcoming authorized publishing these contacts on the portal. *",
    submit: "Register point",
    sending: "Sending…",
    errorGeneric: "Could not submit the form.",
    success: "Point submitted! It will appear on the list after team review.",
  },
} as const;

export function PontoForm({ locale }: { locale: Locale }) {
  const t = TEXT[locale] ?? TEXT.pt;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    setLoading(true);
    try {
      const response = await fetch("/api/pontos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(data.entries()), consentimento: data.get("consentimento") === "sim" }),
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
        {t.name}
        <input name="nome" required maxLength={120} className={INPUT} />
      </label>
      <label className={LABEL}>
        {t.location}
        <input name="localizacao" required maxLength={200} className={INPUT} />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className={LABEL}>
          {t.city}
          <input name="municipio" required maxLength={100} className={INPUT} />
        </label>
        <label className={LABEL}>
          {t.state}
          <input name="estado" maxLength={60} className={INPUT} />
        </label>
        <label className={LABEL}>
          {t.country}
          <input name="pais" required maxLength={60} defaultValue={locale === "en" ? "" : "Brasil"} className={INPUT} />
        </label>
      </div>
      <label className={LABEL}>
        {t.contact}
        <input name="contatoAcolhimento" required maxLength={200} className={INPUT} />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={LABEL}>
          {t.link}
          <input name="siteOuInstagram" maxLength={300} placeholder="https://… ou @perfil" className={INPUT} />
        </label>
        <label className={LABEL}>
          {t.yourEmail}
          <input name="cadastradoPorEmail" type="email" required maxLength={160} autoComplete="email" className={INPUT} />
        </label>
      </div>
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
