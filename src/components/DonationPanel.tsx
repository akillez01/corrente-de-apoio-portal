"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Modal = "pix" | "paypal" | null;

const PAYPAL_AMOUNTS = [25, 50, 100];

export function DonationPanel({ campaignId }: { campaignId: string }) {
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
    setLoading(true);
    try {
      const res = await fetch("/api/dev/simular-doacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, valor, metodo }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        flash(error ?? "Não foi possível simular a doação.");
        return;
      }
      setModal(null);
      flash("Doação confirmada! Progresso atualizado.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-bg p-[18px]">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Apoiar agora
        </h4>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => setModal("pix")}
            className="rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            ◈ Doar com Pix
          </button>
          <button
            onClick={() => setModal("paypal")}
            className="rounded-[10px] border border-border bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-primary"
          >
            Doar com PayPal (internacional)
          </button>
        </div>
        <p className="mt-3 text-[11.5px] text-balance text-muted">
          A doação cai direto na conta institucional no provedor de pagamento. Doações são
          anônimas por padrão; você pode assinar seu nome se quiser.
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
            <h3 className="font-serif text-xl font-semibold">Doar com Pix</h3>
            <p className="mt-1.5 text-balance text-[13px] text-muted">
              Escaneie o QR Code ou copie a chave. Em produção, o webhook do Mercado Pago
              atualiza o progresso em menos de um minuto.
            </p>
            <div className="mx-auto my-4.5 h-[172px] w-[172px] rounded-lg border-[10px] border-white outline outline-1 outline-border [background:repeating-linear-gradient(0deg,#1E2A22_0_6px,transparent_6px_12px),repeating-linear-gradient(90deg,#1E2A22_0_6px,transparent_6px_12px)]" />
            <div className="mb-3.5 break-all rounded-lg border border-border bg-bg p-2.5 font-mono text-[11.5px] text-muted">
              redesol-apoio@pix.org.br
            </div>
            <button
              disabled={loading}
              onClick={() => simular(50, "pix")}
              className="w-full rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? "Confirmando…" : "Simular doação recebida (webhook)"}
            </button>
            <button
              onClick={() => setModal(null)}
              className="mt-3 text-[12.5px] text-muted underline"
            >
              Fechar
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
            <h3 className="font-serif text-xl font-semibold">Doar com PayPal</h3>
            <p className="mt-1.5 text-balance text-[13px] text-muted">
              Você será levado ao ambiente do PayPal para concluir a doação. O sistema não
              armazena nenhum dado de pagamento.
            </p>
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
              {loading ? "Confirmando…" : "Continuar no PayPal (simulação)"}
            </button>
            <button
              onClick={() => setModal(null)}
              className="mt-3 text-[12.5px] text-muted underline"
            >
              Fechar
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
