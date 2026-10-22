"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { PublicPageCopy, PublicPageId } from "@/lib/types/siteContent";

const FIELD_LABELS: Record<string, string> = {
  eyebrow: "Chamada curta",
  title: "Título",
  intro: "Texto de apresentação",
  intro1: "Texto de apresentação — parte 1",
  intro2: "Texto de apresentação — parte 2",
  intro3: "Texto de apresentação — parte 3",
  closing: "Frase de encerramento",
  ctaLabel: "Texto do botão",
  ctaSupport: "Botão de campanhas",
  ctaBack: "Botão para voltar",
  ctaSignUp: "Botão de inscrição",
  ctaSeeImpact: "Botão de impacto",
  note: "Nota",
  emptyTitle: "Título sem conteúdo",
  emptyText: "Mensagem sem conteúdo",
  imageUrl: "Imagem",
  imageAlt: "Descrição acessível da imagem",
  date: "Data",
  badge: "Identificação",
  subtitle: "Texto de apoio",
  urgentPrefix: "Rótulo de urgência",
  verifiedBy: "Texto de verificação",
  transparencyLine: "Linha de transparência",
  report: "Prestação de contas",
  raised: "Rótulo de arrecadação",
  transferred: "Rótulo de repasse",
  transferToBeneficiary: "Texto do repasse",
  confirmedBy: "Rótulo de confirmação",
  seeProof: "Botão do comprovante",
  of: "Preposição dos valores",
  donationsCountSuffix: "Rótulo de doações",
  recentSupport: "Apoios recentes",
  noDonationsYet: "Mensagem sem doações",
  anonymousSupporter: "Apoiador anônimo",
  siteName: "Nome do portal",
  siteTagline: "Subtítulo do cabeçalho",
  footerTagline: "Texto do rodapé",
  contactLabel: "Rótulo de contato",
  rightsLine: "Frase final do rodapé",
  homeLink: "Link Início",
  navAbout: "Menu: O que é?",
  navSupport: "Menu: Preciso de Ajuda",
  navDonate: "Menu: Doar",
  navVolunteer: "Menu: Voluntariar",
  navProject: "Menu: Projetar",
  navIntegrate: "Menu: Integrar",
  navWomen: "Menu: Mulheres",
  navYouth: "Menu: Juventude",
  navNews: "Menu: Notícias",
  navTransparency: "Menu: Transparência",
  pathsEyebrow: "Caminhos — chamada curta",
  pathsTitle: "Caminhos — título",
  aboutLinkLabel: "Link para a página O que é?",
  waitingTitle: "Título da lista de projetos",
  waitingEmpty: "Mensagem sem projetos",
  formTitle: "Título do formulário",
  formIntro: "Texto do formulário",
  tableTitle: "Título da tabela",
  listTitle: "Título da lista",
  listEyebrow: "Lista — chamada curta",
  listIntro: "Lista — apresentação",
  listEmpty: "Mensagem com lista vazia",
  readMore: "Botão ler mais",
  emergencyTitle: "Emergência — título",
  emergencyText: "Emergência — texto",
  supportTitle: "Apoio — título",
  supportText: "Apoio — texto",
  supportCta: "Apoio — botão",
  contactTitle: "Contato — título",
  contactText: "Contato — texto",
  contactCta: "Contato — botão",
  contactEmail: "Contato — e-mail",
  teamLink: "Link da equipe",
  supportNeeded: "Rótulo: apoio necessário",
  shareLabel: "Botão de compartilhar",
  copiedLabel: "Mensagem de link copiado",
  backToList: "Link para voltar à lista",
  instagramLabel: "Rótulo Instagram",
  identityEyebrow: "Identidade — chamada curta",
  identityTitle: "Identidade — título",
  identityIntro: "Identidade — apresentação",
  joinNetwork: "Botão para integrar a rede",
  campaignsButton: "Botão para apoiar campanhas",
  qualifiedTitle: "Título da seção",
  qualifiedText1: "Texto da seção — parte 1",
  qualifiedText2: "Texto da seção — parte 2",
  howItWorksTitle: "Título: como funciona",
  priorityAreasTitle: "Título: áreas prioritárias",
  sustainBadge: "Chamada de sustentação",
  sustainTitle: "Título de sustentação",
  sustainText: "Texto de sustentação",
  donateToSustain: "Botão de campanhas",
  seeHowResourcesApplied: "Botão de transparência",
  calloutTitle: "Título do destaque",
  calloutText: "Texto do destaque",
};

function fieldLabel(key: string): string {
  const numbered = key.match(/^(identity|card|paragraph|step|area|path)(\d+)(Eyebrow|Title|Text)?$/);
  if (numbered) {
    const label = numbered[3] === "Eyebrow" ? "chamada curta" : numbered[3] === "Title" ? "título" : "texto";
    const group = numbered[1] === "identity" ? "Identidade" : numbered[1] === "card" ? "Cartão" : numbered[1] === "paragraph" ? "Parágrafo" : numbered[1] === "step" ? "Etapa" : numbered[1] === "path" ? "Caminho" : "Área";
    return `${group} ${numbered[2]} — ${label}`;
  }
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

export function ContentEditorForm({
  pageId,
  locale,
  initialContent,
}: {
  pageId: PublicPageId;
  locale: Locale;
  initialContent: PublicPageCopy;
}) {
  const [content, setContent] = useState<PublicPageCopy>(initialContent);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(key: string, value: string) {
    setContent((previous) => ({ ...previous, [key]: value }));
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/site-media", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Não foi possível enviar a imagem.");
        return;
      }
      update("imageUrl", result.url);
      setMessage("Imagem enviada. Salve o conteúdo para publicar a alteração.");
    } catch {
      setError("Falha de conexão ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/conteudo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, locale, copy: content }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Não foi possível salvar o conteúdo.");
        return;
      }
      setMessage("Conteúdo publicado com sucesso.");
    } catch {
      setError("Falha de conexão ao salvar o conteúdo.");
    } finally {
      setSaving(false);
    }
  }

  const textFields = Object.entries(content).filter(([key]) => key !== "imageUrl" && key !== "imageAlt");

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-5 rounded-xl border border-[#E6D9BB] bg-[#FFF8EA] p-4 text-[13px] leading-5 text-[#5C4A27]">
        Este painel altera conteúdo público em {locale === "pt" ? "português" : "inglês"}.
        Dados pessoais, consentimentos, textos de segurança e áreas internas não são editáveis aqui.
        Imagens aceitas: JPEG, PNG, WebP ou AVIF, até 4 MB. Metadados de localização são removidos.
      </p>

      <fieldset className="mb-5 rounded-2xl border border-border bg-white p-4 sm:p-5">
        <legend className="px-1 font-serif text-lg font-semibold text-ink">Imagem da página</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-[12.5px] font-semibold text-muted">
            Enviar imagem
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={uploading}
              onChange={(event) => {
                void handleImageUpload(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
              className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-[12.5px] font-semibold text-muted">
            Descrição acessível
            <input
              value={content.imageAlt ?? ""}
              onChange={(event) => update("imageAlt", event.target.value)}
              maxLength={300}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        {content.imageUrl && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Image
              src={content.imageUrl}
              alt={content.imageAlt || ""}
              width={320}
              height={180}
              className="h-32 w-56 rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => update("imageUrl", "")}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary"
            >
              Remover imagem
            </button>
          </div>
        )}
      </fieldset>

      {textFields.map(([key, value]) => (
        <label key={key} className="mb-4 block text-[12.5px] font-semibold text-muted">
          {fieldLabel(key)}
          <textarea
            value={value}
            onChange={(event) => update(key, event.target.value)}
            rows={value.length > 120 || key.toLowerCase().includes("text") || key.toLowerCase().includes("intro") ? 3 : 2}
            maxLength={5000}
            className="mt-1 w-full resize-y rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
      ))}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-[0_12px_24px_rgba(25,51,39,.08)]">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar e publicar conteúdo"}
        </button>
        {uploading && <span role="status" className="text-[13px] text-muted">Enviando imagem…</span>}
        {message && <span role="status" className="text-[13px] text-primary">{message}</span>}
        {error && <span role="alert" className="text-[13px] text-urgent">{error}</span>}
      </div>
    </form>
  );
}
