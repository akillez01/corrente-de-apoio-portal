"use client";

import { FORMAS_CONTATO } from "@/lib/domain/acolhimento";
import {
  AREA_LABELS,
  AREAS_ATUACAO,
  MODALIDADE_LABELS_EN,
  MODALIDADES,
  OFERTA_LABELS_EN,
  OFERTAS,
} from "@/lib/domain/voluntariado";
import type { Locale } from "@/lib/i18n/config";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/storage/limits";
import { useState } from "react";

const TEXT = {
  pt: {
    intro: "Campos com * são obrigatórios. Seus dados ficam visíveis apenas para a equipe da rede.",
    identification: "1. Identificação",
    fullName: "Nome completo *",
    email: "E-mail *",
    phone: "Telefone / WhatsApp *",
    contactPreference: "Forma preferencial de contato *",
    birthDate: "Data de nascimento",
    city: "Município *",
    state: "Estado",
    country: "País *",
    territory: "Território ou comunidade",
    offer: "2. Posso oferecer",
    offerHint: "Marque tudo o que você pode oferecer à rede. *",
    areas: "Áreas em que pode atuar *",
    areasHint: "A equipe usa as áreas para encontrar voluntários quando surge uma demanda.",
    profession: "Profissão",
    education: "Formação",
    skills: "Habilidades e conhecimentos *",
    offerDetails: "Detalhe o que pode oferecer (serviços, equipamentos, materiais, espaço, recursos…)",
    availability: "Disponibilidade de tempo",
    availabilityPlaceholder: "Ex.: 4 horas por semana, fins de semana",
    modality: "Modalidade",
    select: "Selecione",
    attachDocument: `Currículo ou portfólio (opcional, até ${MAX_UPLOAD_LABEL})`,
    consent:
      "Autorizo a equipe do Daime Solidariedade a usar estes dados para me contatar sobre oportunidades de voluntariado, conforme a LGPD. Meus dados não serão publicados. *",
    sending: "Enviando…",
    submit: "Enviar cadastro",
    errorNoOffer: "Marque pelo menos uma opção em “Posso oferecer”.",
    errorNoArea: "Selecione pelo menos uma área de atuação.",
    errorFile: `O arquivo excede o limite de ${MAX_UPLOAD_LABEL}.`,
    errorGeneric: "Não foi possível enviar o cadastro.",
    success: "Cadastro enviado! Agora é só aguardar o chamado da equipe.",
  },
  en: {
    intro: "Fields marked with * are required. Your data is visible only to the network team.",
    identification: "1. Identification",
    fullName: "Full name *",
    email: "Email *",
    phone: "Phone / WhatsApp *",
    contactPreference: "Preferred contact method *",
    birthDate: "Date of birth",
    city: "City *",
    state: "State",
    country: "Country *",
    territory: "Territory or community",
    offer: "2. What I can offer",
    offerHint: "Check everything you can offer the network. *",
    areas: "Areas you can work in *",
    areasHint: "The team uses these areas to find volunteers when a need comes up.",
    profession: "Profession",
    education: "Education",
    skills: "Skills and knowledge *",
    offerDetails: "Describe what you can offer (services, equipment, materials, space, resources…)",
    availability: "Time availability",
    availabilityPlaceholder: "E.g. 4 hours a week, weekends",
    modality: "Format",
    select: "Select",
    attachDocument: `Resume or portfolio (optional, up to ${MAX_UPLOAD_LABEL})`,
    consent:
      "I authorize the Daime Solidariedade team to use this data to contact me about volunteer opportunities. My data will not be published. *",
    sending: "Sending…",
    submit: "Submit",
    errorNoOffer: "Check at least one option under “What I can offer”.",
    errorNoArea: "Select at least one area.",
    errorFile: `The file exceeds the ${MAX_UPLOAD_LABEL} limit.`,
    errorGeneric: "Could not submit the form.",
    success: "Submitted! Now just wait for the team to get in touch.",
  },
} as const;

const CONTACT_LABELS_EN: Record<string, string> = { "E-mail": "Email", Telefone: "Phone", WhatsApp: "WhatsApp" };

const INPUT =
  "mt-1 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary";
const LABEL = "text-[12.5px] font-semibold text-muted";
const FIELDSET = "flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5";
const LEGEND = "px-1 font-serif text-lg font-semibold text-ink";

export function VoluntarioForm({ locale }: { locale: Locale }) {
  const t = TEXT[locale] ?? TEXT.pt;
  const en = locale === "en";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    if (formData.getAll("ofertas").length === 0) {
      setError(t.errorNoOffer);
      return;
    }
    if (formData.getAll("areasAtuacao").length === 0) {
      setError(t.errorNoArea);
      return;
    }
    const documento = formData.get("documento");
    if (documento instanceof File && documento.size > MAX_UPLOAD_BYTES) {
      setError(t.errorFile);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/voluntarios", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? t.errorGeneric);
        return;
      }
      form.reset();
      setSuccess(t.success);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-[13px] text-muted">{t.intro}</p>

      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>{t.identification}</legend>
        <label className={LABEL}>
          {t.fullName}
          <input name="nomeCompleto" required maxLength={120} autoComplete="name" className={INPUT} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={LABEL}>
            {t.email}
            <input name="email" type="email" required maxLength={160} autoComplete="email" className={INPUT} />
          </label>
          <label className={LABEL}>
            {t.phone}
            <input name="telefone" type="tel" required maxLength={40} autoComplete="tel" className={INPUT} />
          </label>
          <label className={LABEL}>
            {t.contactPreference}
            <select name="formaContato" required defaultValue="WhatsApp" className={INPUT}>
              {FORMAS_CONTATO.map((forma) => (
                <option key={forma} value={forma}>
                  {en ? CONTACT_LABELS_EN[forma] : forma}
                </option>
              ))}
            </select>
          </label>
          <label className={LABEL}>
            {t.birthDate}
            <input name="dataNascimento" type="date" className={INPUT} />
          </label>
          <label className={LABEL}>
            {t.city}
            <input name="cidade" required maxLength={100} autoComplete="address-level2" className={INPUT} />
          </label>
          <label className={LABEL}>
            {t.state}
            <input name="estado" maxLength={60} autoComplete="address-level1" className={INPUT} />
          </label>
          <label className={LABEL}>
            {t.country}
            <input name="pais" required maxLength={60} defaultValue={en ? "" : "Brasil"} autoComplete="country-name" className={INPUT} />
          </label>
          <label className={LABEL}>
            {t.territory}
            <input name="territorio" maxLength={120} className={INPUT} />
          </label>
        </div>
      </fieldset>

      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>{t.offer}</legend>
        <p className="text-xs text-muted">{t.offerHint}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {OFERTAS.map((oferta) => (
            <label key={oferta} className="flex items-start gap-2 text-[13px] text-ink">
              <input name="ofertas" type="checkbox" value={oferta} className="mt-0.5 accent-primary" />
              {en ? OFERTA_LABELS_EN[oferta] : oferta}
            </label>
          ))}
        </div>

        <p className={`${LABEL} mt-2`}>{t.areas}</p>
        <p className="-mt-2 text-xs text-muted">{t.areasHint}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {AREAS_ATUACAO.map((area) => (
            <label key={area} className="flex items-start gap-2 text-[13px] text-ink">
              <input name="areasAtuacao" type="checkbox" value={area} className="mt-0.5 accent-primary" />
              {AREA_LABELS[area][en ? "en" : "pt"]}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={LABEL}>
            {t.profession}
            <input name="profissao" maxLength={160} className={INPUT} />
          </label>
          <label className={LABEL}>
            {t.education}
            <input name="formacao" maxLength={200} className={INPUT} />
          </label>
        </div>
        <label className={LABEL}>
          {t.skills}
          <textarea name="habilidades" required maxLength={1500} className={`${INPUT} min-h-[80px] resize-y`} />
        </label>
        <label className={LABEL}>
          {t.offerDetails}
          <textarea name="detalhesOferta" maxLength={1500} className={`${INPUT} min-h-[80px] resize-y`} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={LABEL}>
            {t.availability}
            <input name="disponibilidade" maxLength={200} placeholder={t.availabilityPlaceholder} className={INPUT} />
          </label>
          <label className={LABEL}>
            {t.modality}
            <select name="modalidade" defaultValue="" className={INPUT}>
              <option value="">{t.select}</option>
              {MODALIDADES.map((modalidade) => (
                <option key={modalidade} value={modalidade}>
                  {en ? MODALIDADE_LABELS_EN[modalidade] : modalidade}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={LABEL}>
          {t.attachDocument}
          <input
            name="documento"
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="mt-1 w-full rounded-lg border border-dashed border-border bg-bg px-3.5 py-3 text-[12.5px]"
          />
        </label>
      </fieldset>

      <label className="flex items-start gap-2.5 rounded-lg border border-border bg-bg p-3.5 text-[12.5px]">
        <input name="concordaTermos" type="checkbox" value="sim" required className="mt-0.5" />
        <span>{t.consent}</span>
      </label>

      {error && <p role="alert" className="text-[13px] text-urgent">{error}</p>}
      {success && <p role="status" className="rounded-lg bg-[#EFF7F1] p-3 text-[13px] text-[#1F4E39]">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? t.sending : t.submit}
      </button>
    </form>
  );
}
