"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIAS = ["Saúde", "Moradia", "Educação", "Alimentação", "Outro"];

export function NovoPedidoForm() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [urgente, setUrgente] = useState(false);
  const [meta, setMeta] = useState("");
  const [prazo, setPrazo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("titulo", titulo);
    formData.set("categoria", categoria);
    formData.set("urgente", String(urgente));
    formData.set("meta", meta);
    formData.set("prazo", prazo);
    formData.set("descricao", descricao);
    formData.set("consentimentoLgpd", String(consentimento));
    files.forEach((file) => formData.append("anexos", file));

    try {
      const res = await fetch("/api/pedidos", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Não foi possível enviar o pedido.");
        return;
      }
      router.push("/meus-pedidos");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-[560px] flex-col gap-4">
      <h1 className="font-serif text-2xl font-semibold">Novo pedido de apoio</h1>
      <p className="text-[13px] text-muted">
        Conte sua necessidade com o máximo de detalhes. A equipe da curadoria vai entrar em
        contato antes de qualquer publicação — nada do que você escrever aqui vai ao ar sem
        revisão junto com você.
      </p>

      <label className="text-[12.5px] font-semibold text-muted">
        Título do pedido
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Cirurgia cardíaca do meu filho"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-[12.5px] font-semibold text-muted">
          Categoria
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12.5px] font-semibold text-muted">
          Meta (R$)
          <input
            type="number"
            required
            min={1}
            step="0.01"
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-[12.5px] font-semibold text-muted">
          Prazo desejado (opcional)
          <input
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="mt-6 flex items-center gap-2 text-[12.5px] font-semibold text-muted">
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
          Marcar como urgente
        </label>
      </div>

      <label className="text-[12.5px] font-semibold text-muted">
        Descreva sua necessidade
        <textarea
          required
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Esse texto é privado — só a curadoria vê. O texto que vai ao ar é reescrito junto com você."
          className="mt-1 min-h-[140px] w-full resize-y rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="text-[12.5px] font-semibold text-muted">
        Anexos (laudos, orçamentos, comprovantes)
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="mt-1 w-full rounded-lg border border-dashed border-border bg-bg px-3.5 py-3 text-[12.5px]"
        />
      </label>

      <label className="flex items-start gap-2.5 rounded-lg border border-border bg-bg p-3.5 text-[12.5px]">
        <input
          type="checkbox"
          checked={consentimento}
          onChange={(e) => setConsentimento(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Autorizo o tratamento dos meus dados pessoais e, quando aplicável, dados sensíveis
          de saúde, pela equipe social da instituição, exclusivamente para análise e
          divulgação deste pedido de apoio, conforme a LGPD. Sei que nenhum documento
          anexado será publicado — apenas um texto revisado junto comigo.
        </span>
      </label>

      {error && <p className="text-[13px] text-urgent">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Enviando…" : "Enviar pedido"}
      </button>
    </form>
  );
}
