"use client";

import type { Locale } from "@/lib/i18n/config";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Modal = "pix" | "paypal" | null;

const PAYPAL_AMOUNTS = [25, 50, 100];
const donationSimulationEnabled = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

const TEXT = {
  pt: {
    donationsComingSoon: "As doações online estão em configuração. Tente novamente em breve.",
    donationsComingSoonShort: "As doações online estão em configuração.",
    couldNotSimulate: "Não foi possível simular a doação.",
    donationConfirmed: "Doação confirmada! Progresso atualizado.",
    supportNow: "Apoiar agora",
    payWithPix: "◈ Doar com Pix",
    payWithPaypal: "Doar com PayPal (internacional)",
    devMode: "Modo de desenvolvimento: os botões abaixo simulam a confirmação do provedor de pagamento.",
    disabledNote: "Doações online estão em configuração. Este portal não processa pagamentos nesta etapa.",
    pixTitle: "Doar com Pix",
    pixSubtitle:
      "Escaneie o QR Code ou copie a chave. Em produção, o webhook do Mercado Pago atualiza o progresso em menos de um minuto.",
    confirming: "Confirmando…",
    simulatePix: "Simular doação recebida (webhook)",
    close: "Fechar",
    paypalTitle: "Doar com PayPal",
    paypalSubtitle:
      "Você será levado ao ambiente do PayPal para concluir a doação. O sistema não armazena nenhum dado de pagamento.",
    continuePaypal: "Continuar no PayPal (simulação)",
  },
  en: {
    donationsComingSoon: "Online donations are being set up. Please try again soon.",
    donationsComingSoonShort: "Online donations are being set up.",
    couldNotSimulate: "Could not simulate the donation.",
    donationConfirmed: "Donation confirmed! Progress updated.",
    supportNow: "Support now",
    payWithPix: "◈ Donate with Pix",
    payWithPaypal: "Donate with PayPal (international)",
    devMode: "Development mode: the buttons below simulate the payment provider's confirmation.",
    disabledNote: "Online donations are being set up. This portal doesn't process payments at this stage.",
    pixTitle: "Donate with Pix",
    pixSubtitle:
      "Scan the QR code or copy the key. In production, the Mercado Pago webhook updates progress in under a minute.",
    confirming: "Confirming…",
    simulatePix: "Simulate donation received (webhook)",
    close: "Close",
    paypalTitle: "Donate with PayPal",
    paypalSubtitle: "You'll be taken to PayPal to complete the donation. The system stores no payment data.",
    continuePaypal: "Continue on PayPal (simulation)",
  },
} as const;

export function DonationPanel({ campaignId, locale }: { campaignId: string; locale: Locale }) {
  const t = TEXT[locale] ?? TEXT.pt;
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [paypalAmount, setPaypalAmount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function simular(valor: number, metodo: "pix" | "paypal") {
    if (!donationSimulationEnabled) {
      flash(t.donationsComingSoon);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dev/simular-doacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, valor, metodo }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        flash(error ?? t.couldNotSimulate);
        return;
      }
      setModal(null);
      flash(t.donationConfirmed);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-bg p-[18px]">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{t.supportNow}</h4>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => (donationSimulationEnabled ? setModal("pix") : flash(t.donationsComingSoonShort))}
            className="rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {t.payWithPix}
          </button>
          <button
            onClick={() => (donationSimulationEnabled ? setModal("paypal") : flash(t.donationsComingSoonShort))}
            className="rounded-[10px] border border-border bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-primary"
          >
            {t.payWithPaypal}
          </button>
        </div>
        <p className="mt-3 text-[11.5px] text-balance text-muted">
          {donationSimulationEnabled ? t.devMode : t.disabledNote}
        </p>
      </div>

      {modal === "pix" && (
        <div
          onClick={() => setModal(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,30,24,.55)] p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[390px] rounded-2xl bg-white p-7 text-center"
          >
            <h3 className="font-serif text-xl font-semibold">{t.pixTitle}</h3>
            <p className="mt-1.5 text-balance text-[13px] text-muted">{t.pixSubtitle}</p>
            <div className="mx-auto my-4.5 h-[172px] w-[172px] rounded-lg border-[10px] border-white outline outline-1 outline-border [background:repeating-linear-gradient(0deg,#1E2A22_0_6px,transparent_6px_12px),repeating-linear-gradient(90deg,#1E2A22_0_6px,transparent_6px_12px)]" />
            <div className="mb-3.5 break-all rounded-lg border border-border bg-bg p-2.5 font-mono text-[11.5px] text-muted">
              redesol-apoio@pix.org.br
            </div>
            <button
              disabled={loading}
              onClick={() => simular(50, "pix")}
              className="w-full rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? t.confirming : t.simulatePix}
            </button>
            <button onClick={() => setModal(null)} className="mt-3 text-[12.5px] text-muted underline">
              {t.close}
            </button>
          </div>
        </div>
      )}

      {modal === "paypal" && (
        <div
          onClick={() => setModal(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,30,24,.55)] p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[390px] rounded-2xl bg-white p-7 text-center"
          >
            <h3 className="font-serif text-xl font-semibold">{t.paypalTitle}</h3>
            <p className="mt-1.5 text-balance text-[13px] text-muted">{t.paypalSubtitle}</p>
            <div className="my-4.5 flex justify-center gap-2">
              {PAYPAL_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setPaypalAmount(amount)}
                  className={
                    amount === paypalAmount
                      ? "rounded-lg border border-primary bg-[#EDF6EF] px-3.5 py-2 font-mono text-[12.5px] font-semibold text-primary"
                      : "rounded-lg border border-border px-3.5 py-2 font-mono text-[12.5px]"
                  }
                >
                  € {amount}
                </button>
              ))}
            </div>
            <button
              disabled={loading}
              onClick={() => simular(paypalAmount, "paypal")}
              className="w-full rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? t.confirming : t.continuePaypal}
            </button>
            <button onClick={() => setModal(null)} className="mt-3 text-[12.5px] text-muted underline">
              {t.close}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 rounded-xl bg-header px-5 py-3 text-sm text-white shadow-[0_14px_34px_rgba(20,30,24,.3)]">
          {toast}
        </div>
      )}
    </>
  );
}
