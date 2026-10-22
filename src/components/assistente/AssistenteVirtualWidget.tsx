"use client";

import { useEffect, useState } from "react";

interface AssistantReply {
  intent: string;
  title: string;
  answer: string;
  nextSteps: string[];
  ctas: Array<{ label: string; href: string }>;
}

const QUICK_PROMPTS = [
  "Preciso de apoio",
  "Quero ser voluntário",
  "Como apoiar campanhas?",
  "Quero propor um projeto",
  "Como funciona a transparência?",
];

export function AssistenteVirtualWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [mobileFloatingVisible, setMobileFloatingVisible] = useState(false);

  useEffect(() => {
    function openAssistant() {
      setOpen(true);
    }
    window.addEventListener("daime:open-assistant", openAssistant);
    return () => window.removeEventListener("daime:open-assistant", openAssistant);
  }, []);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 639px)");
    function updateVisibility() {
      setMobileFloatingVisible(!mobileViewport.matches || window.scrollY > 240);
    }
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (footerVisible) setOpen(false);
  }, [footerVisible]);

  async function ask(text: string) {
    const content = text.trim();
    if (!content) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Não foi possível responder agora.");
        return;
      }

      setReply(result.reply);
      setInteractionId(typeof result.interactionId === "string" ? result.interactionId : null);
      setMessage("");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function trackCtaClick(label: string, href: string) {
    if (!interactionId || !reply) return;

    void fetch("/api/assistente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "cta_click",
        interactionId,
        intent: reply.intent,
        ctaLabel: label,
        ctaHref: href,
      }),
      keepalive: true,
    });
  }

  return (
    <div className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[400] w-[min(92vw,380px)] ${footerVisible && !open ? "pointer-events-none invisible" : ""} ${!mobileFloatingVisible ? "max-sm:hidden" : ""}`}>
      {open && (
        <div className="mb-3 overflow-hidden rounded-2xl border border-[#D4E1DA] bg-white shadow-[0_20px_48px_rgba(18,43,33,.22)]">
          <div className="bg-[#113A2B] px-4 py-3 text-white">
            <h3 className="font-serif text-lg font-semibold">Assistente ICEFLU</h3>
            <p className="text-[12px] text-white/80">
              Orientacao para doacao, pedidos, voluntariado e atendimento social.
            </p>
          </div>

          <div className="max-h-[min(58vh,calc(100dvh-13rem))] overflow-auto p-4">
            {!reply && (
              <div className="mb-3 rounded-xl border border-[#E7D7B4] bg-[#FFF8E9] p-3 text-[13px] text-[#6A5224]">
                Escreva sua duvida ou toque em um atalho.
              </div>
            )}

            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={loading}
                  onClick={() => ask(prompt)}
                  className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-left text-[12px] text-[#1E3A2E] transition hover:border-primary disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {reply && (
              <div className="rounded-xl border border-border bg-[#F9FCFA] p-3">
                <h4 className="font-serif text-[17px] font-semibold text-[#163E30]">{reply.title}</h4>
                <p className="mt-1.5 text-[13px] text-[#365247]">{reply.answer}</p>

                <ul className="mt-2.5 list-disc space-y-1 pl-5 text-[12.5px] text-[#365247]">
                  {reply.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap gap-2">
                  {reply.ctas.map((cta) => (
                    <a
                      key={`${cta.href}-${cta.label}`}
                      href={cta.href}
                      onClick={() => trackCtaClick(cta.label, cta.href)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-primary-dark"
                    >
                      {cta.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {error && <p role="alert" className="mt-2 text-[12.5px] text-urgent">{error}</p>}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask(message);
            }}
            className="border-t border-border bg-white p-3"
          >
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ex.: preciso de apoio urgente"
                className="w-full min-w-0 rounded-lg border border-border px-3 py-2 text-base outline-none focus:border-primary sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "..." : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar assistente" : "Abrir assistente de ajuda"}
        aria-expanded={open}
        className="ml-auto flex rounded-full bg-[#C8831F] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(200,131,31,.42)] transition hover:bg-[#AD721A] max-sm:h-12 max-sm:w-12 max-sm:justify-center max-sm:px-0 max-sm:py-0"
      >
        <span className="sm:hidden" aria-hidden="true">{open ? "×" : "?"}</span>
        <span className="hidden sm:inline">{open ? "Fechar assistente" : "Precisa de ajuda?"}</span>
      </button>
    </div>
  );
}
