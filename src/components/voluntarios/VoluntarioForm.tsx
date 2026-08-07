"use client";

import { useMemo, useState } from "react";

const SEXO_OPTIONS = ["Feminino", "Masculino", "Outro", "Prefiro nao dizer"];
const ESTADO_CIVIL_OPTIONS = [
  "Solteiro/a",
  "Casado/a",
  "Divorciado/a",
  "Viuvo/a",
  "Relacao estavel",
];
const SIM_NAO = ["Sim", "Nao"];
const SIM_NAO_TALVEZ = ["Sim", "Nao", "Talvez"];

function countWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function VoluntarioForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [motivacao, setMotivacao] = useState("");

  const motivacaoWords = useMemo(() => countWords(motivacao), [motivacao]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (motivacaoWords > 200) {
      setError("A motivacao deve ter no maximo 200 palavras.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    try {
      const response = await fetch("/api/voluntarios", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Nao foi possivel enviar a inscricao.");
        return;
      }

      form.reset();
      setMotivacao("");
      setSuccess(
        "Inscricao enviada com sucesso. Nossa equipe vai analisar suas informacoes e retornar por e-mail.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <p className="mb-4 text-[13px] text-muted">
        Campos com * sao obrigatorios. O envio deste formulario registra seu interesse no
        programa de voluntariado da Rede Sol.
      </p>

      <section className="mb-5">
        <h2 className="mb-3 font-serif text-lg font-semibold">Dados pessoais</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-[12.5px] font-semibold text-muted">
            E-mail *
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted md:col-span-2">
            Nome completo *
            <input
              name="nomeCompleto"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Telefone *
            <input
              name="telefone"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Data de nascimento *
            <input
              name="dataNascimento"
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Sexo *
            <select
              name="sexo"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="" disabled>
                Selecione
              </option>
              {SEXO_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Estado civil *
            <select
              name="estadoCivil"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="" disabled>
                Selecione
              </option>
              {ESTADO_CIVIL_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Possui filhos/as? *
            <select
              name="possuiFilhos"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="" disabled>
                Selecione
              </option>
              {SIM_NAO.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 font-serif text-lg font-semibold">Informacoes de endereco</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-[12.5px] font-semibold text-muted md:col-span-2">
            Endereco completo (com CEP) *
            <input
              name="enderecoCompleto"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Cidade *
            <input
              name="cidade"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Estado *
            <input
              name="estado"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted md:col-span-2">
            Pais *
            <input
              name="pais"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 font-serif text-lg font-semibold">Qualificacoes e experiencia</h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[12.5px] font-semibold text-muted">
            Formacao academica *
            <input
              name="formacaoAcademica"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Experiencia profissional (se aplicavel)
            <textarea
              name="experienciaProfissional"
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Experiencia em trabalho voluntario (se aplicavel)
            <textarea
              name="experienciaVoluntariado"
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Situacao atual de trabalho *
            <input
              name="situacaoTrabalho"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 font-serif text-lg font-semibold">Motivacao</h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[12.5px] font-semibold text-muted">
            Por que deseja ser voluntario da Assistencia Social e Saude em comunidades na
            Amazonia? (max. 200 palavras) *
            <textarea
              name="motivacao"
              required
              value={motivacao}
              onChange={(event) => setMotivacao(event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <span className="mt-1 block text-[11px] font-normal text-muted">
              {motivacaoWords}/200 palavras
            </span>
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Ja esteve na Amazonia? Caso afirmativo, em qual regiao? *
            <textarea
              name="experienciaAmazonia"
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 font-serif text-lg font-semibold">Disponibilidade pessoal e financeira</h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[12.5px] font-semibold text-muted">
            Dias e horarios de disponibilidade *
            <textarea
              name="disponibilidade"
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Quanto tempo pode se comprometer? (horas/semana, meses etc.) *
            <input
              name="tempoCompromisso"
              required
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Poderia morar por um periodo nas comunidades participantes da Rede Sol? *
            <select
              name="morarComunidade"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="" disabled>
                Selecione
              </option>
              {SIM_NAO_TALVEZ.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Caso possa atuar in loco, conseguiria arcar com despesas de logistica? *
            <select
              name="arcariaLogistica"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="" disabled>
                Selecione
              </option>
              {SIM_NAO_TALVEZ.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 font-serif text-lg font-semibold">Habilidades e interesses</h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[12.5px] font-semibold text-muted">
            Quais habilidades/conhecimentos especificos voce possui? *
            <textarea
              name="habilidades"
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Principais interesses e paixoes relacionados a este voluntariado *
            <textarea
              name="interesses"
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 font-serif text-lg font-semibold">Outras informacoes</h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[12.5px] font-semibold text-muted">
            Referencias ou experiencias adicionais
            <textarea
              name="referencias"
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Necessidade ou consideracao especial
            <textarea
              name="consideracoesEspeciais"
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-[12.5px] font-semibold text-muted">
            Anexar curriculo ou documento relevante (max 10MB, opcional)
            <input
              name="documento"
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="mt-1 w-full rounded-lg border border-dashed border-border bg-bg px-3 py-2.5 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="mb-5 rounded-xl border border-[#E9DAB7] bg-[#FFF7E9] p-4">
        <h2 className="mb-3 font-serif text-lg font-semibold">Termos e declaracoes</h2>
        <label className="mb-2 flex items-start gap-2 text-[13px]">
          <input name="concordaTermos" type="checkbox" value="sim" required className="mt-1" />
          Li e concordo com os termos e condicoes deste programa de voluntariado. *
        </label>
        <label className="flex items-start gap-2 text-[13px]">
          <input name="declaraVerdade" type="checkbox" value="sim" required className="mt-1" />
          Ao enviar este formulario, declaro que as informacoes fornecidas sao verdadeiras e
          precisas. *
        </label>
      </section>

      {error && <p className="mb-3 text-[13px] text-urgent">{error}</p>}
      {success && <p className="mb-3 text-[13px] text-primary">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Enviando inscricao..." : "Enviar inscricao"}
      </button>
    </form>
  );
}
