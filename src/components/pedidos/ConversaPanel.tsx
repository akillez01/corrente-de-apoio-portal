"use client";

import type { RequestMessage } from "@/lib/types/domain";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Conversa do pedido, usada pela pessoa atendida e pela equipe (mesma API).
export function ConversaPanel({
  requestId,
  mensagens,
  viewer,
  disabled,
}: {
  requestId: string;
  mensagens: RequestMessage[];
  viewer: "requerente" | "equipe";
  disabled?: boolean;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ordered = [...mensagens].sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/pedidos/${requestId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      if (!response.ok) {
        setError((await response.json()).error ?? "Não foi possível enviar.");
        return;
      }
      setTexto("");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5">
      <div>
        <h2 className="font-serif text-xl font-semibold">
          {viewer === "requerente" ? "Conversa com a equipe" : "Mensagens com a pessoa atendida"}
        </h2>
        <p className="mt-1 text-[12.5px] text-muted">
          {viewer === "requerente"
            ? "Use para responder pedidos de informação, avisar mudanças ou tirar dúvidas."
            : "Visível para a pessoa em “Meus pedidos”. Não escreva aqui dados do prontuário."}
        </p>
      </div>

      {ordered.length === 0 ? (
        <p className="text-[13px] text-muted">Nenhuma mensagem ainda.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {ordered.map((msg, index) => {
            const fromPerson = msg.origem === "requerente";
            const mine = (viewer === "requerente") === fromPerson;
            return (
              <li
                key={index}
                className={`max-w-[85%] rounded-xl border p-3 text-[13px] ${
                  mine ? "self-end border-[#CFE3D6] bg-[#EFF7F1]" : "self-start border-border bg-bg"
                }`}
              >
                <div className="text-[11.5px] text-muted">
                  {fromPerson ? msg.autor : `${msg.autor} · equipe`} · {new Date(msg.criadoEm).toLocaleString("pt-BR")}
                </div>
                <p className="mt-1 whitespace-pre-line">{msg.texto}</p>
              </li>
            );
          })}
        </ol>
      )}

      {!disabled && (
        <form onSubmit={enviar} className="flex flex-col gap-2">
          <textarea
            required
            maxLength={3000}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={viewer === "requerente" ? "Escreva sua mensagem para a equipe…" : "Escreva para a pessoa atendida…"}
            className="min-h-[80px] w-full resize-y rounded-xl border border-border bg-white p-3 text-[13.5px] outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-fit rounded-[10px] bg-primary px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Enviando…" : "Enviar mensagem"}
          </button>
        </form>
      )}
      {error && <p role="alert" className="text-[13px] text-urgent">{error}</p>}
    </section>
  );
}
