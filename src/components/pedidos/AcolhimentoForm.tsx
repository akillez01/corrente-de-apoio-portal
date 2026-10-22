"use client";

import { establishSession } from "@/lib/auth/clientSession";
import {
  CATEGORIAS_DEMANDA,
  FAIXAS_RENDA,
  FORMAS_CONTATO,
  SITUACOES_ALIMENTARES,
  SITUACOES_HABITACIONAIS,
  SITUACOES_TRABALHO,
  type FormaContato,
} from "@/lib/domain/acolhimento";
import { auth } from "@/lib/firebase/client";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/storage/limits";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INPUT =
  "mt-1 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const LABEL = "text-[12.5px] font-semibold text-muted";
const FIELDSET = "flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:p-5";
const LEGEND = "px-1 font-serif text-lg font-semibold text-ink";

type FamilyState = Record<
  "integrantes" | "faixaEtaria" | "dependentes" | "composicaoDomiciliar" | "outrasInformacoes",
  string
>;
type SocioState = Record<
  | "situacaoTrabalho"
  | "renda"
  | "fontesRenda"
  | "beneficios"
  | "despesasEssenciais"
  | "situacaoAlimentar"
  | "situacaoHabitacional",
  string
>;

// Cadastro de acolhimento em módulos. No portal público cria a conta (e-mail e senha)
// para a pessoa acompanhar o pedido; na área logada reaproveita a sessão atual.
export function AcolhimentoForm({
  requireAccount,
  initialName = "",
  initialEmail = "",
  loginHref,
}: {
  requireAccount: boolean;
  initialName?: string;
  initialEmail?: string;
  loginHref: string;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [nome, setNome] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [nomeSocial, setNomeSocial] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [territorio, setTerritorio] = useState("");
  const [telefone, setTelefone] = useState("");
  const [formaContato, setFormaContato] = useState<FormaContato>("WhatsApp");
  const [familia, setFamilia] = useState<FamilyState>({
    integrantes: "",
    faixaEtaria: "",
    dependentes: "",
    composicaoDomiciliar: "",
    outrasInformacoes: "",
  });
  const [socio, setSocio] = useState<SocioState>({
    situacaoTrabalho: "",
    renda: "",
    fontesRenda: "",
    beneficios: "",
    despesasEssenciais: "",
    situacaoAlimentar: "",
    situacaoHabitacional: "",
  });
  const [categorias, setCategorias] = useState<string[]>([]);
  const [descricao, setDescricao] = useState("");
  const [urgente, setUrgente] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [consentimento, setConsentimento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailEmUso, setEmailEmUso] = useState(false);

  useEffect(() => {
    if (!requireAccount) return;
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user?.email) setEmail(user.email);
      if (user?.displayName) setNome((value) => value || user.displayName || "");
    });
  }, [requireAccount]);

  const precisaCriarConta = requireAccount && !currentUser;

  function toggleCategoria(categoria: string, checked: boolean) {
    setCategorias((current) =>
      checked ? [...current, categoria] : current.filter((item) => item !== categoria),
    );
  }

  async function ensureSession(): Promise<boolean> {
    if (!requireAccount) return true;
    let user = currentUser;
    if (!user) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), senha);
        user = credential.user;
        await updateProfile(user, { displayName: nome.trim() });
        await user.getIdToken(true);
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "auth/email-already-in-use") {
          setEmailEmUso(true);
          setError("Já existe uma conta com este e-mail. Entre com sua senha para continuar o cadastro.");
        } else if (code === "auth/weak-password") {
          setError("Escolha uma senha mais forte, com pelo menos 8 caracteres.");
        } else if (code === "auth/invalid-email") {
          setError("Confira o e-mail informado.");
        } else {
          setError("Não foi possível criar sua conta agora. Tente novamente em alguns minutos.");
        }
        return false;
      }
    }
    const role = await establishSession(user);
    if (role !== "requerente" && role !== "admin") {
      setError("Esta conta é da equipe e não pode abrir pedidos de acolhimento. Use outra conta.");
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setEmailEmUso(false);
    if (categorias.length === 0) {
      setError("Marque pelo menos uma categoria em “Preciso de apoio”.");
      return;
    }
    if (precisaCriarConta && senha.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (precisaCriarConta && senha !== confirmacaoSenha) {
      setError("A confirmação da senha não confere.");
      return;
    }
    if (formaContato !== "E-mail" && telefone.replace(/\D/g, "").length < 8) {
      setError("Informe um telefone ou WhatsApp com DDD para o contato.");
      return;
    }
    if (files.reduce((sum, file) => sum + file.size, 0) > MAX_UPLOAD_BYTES) {
      setError(`O total dos anexos não pode passar de ${MAX_UPLOAD_LABEL}.`);
      return;
    }

    setLoading(true);
    try {
      if (!(await ensureSession())) return;

      const formData = new FormData();
      formData.set("nome", nome);
      formData.set("email", email);
      formData.set("nomeSocial", nomeSocial);
      formData.set("dataNascimento", dataNascimento);
      formData.set("municipio", municipio);
      formData.set("territorio", territorio);
      formData.set("formaContato", formaContato);
      formData.set("contato", formaContato === "E-mail" ? email : telefone);
      formData.set("telefone", telefone);
      Object.entries(familia).forEach(([key, value]) => formData.set(`familia.${key}`, value));
      Object.entries(socio).forEach(([key, value]) => formData.set(`socio.${key}`, value));
      categorias.forEach((categoria) => formData.append("categorias", categoria));
      formData.set("descricao", descricao);
      formData.set("urgente", String(urgente));
      formData.set("consentimentoLgpd", String(consentimento));
      files.forEach((file) => formData.append("anexos", file));

      const res = await fetch("/api/pedidos", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Não foi possível enviar o cadastro.");
        return;
      }
      router.push(result.anexosFalharam ? "/meus-pedidos?enviado=1&anexos=falha" : "/meus-pedidos?enviado=1");
      router.refresh();
    } catch {
      setError("Falha de conexão. Confira sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>1. Identificação</legend>
        <label className={LABEL}>
          Nome completo
          <input required maxLength={120} autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} className={INPUT} />
        </label>
        <label className={LABEL}>
          Nome social (quando aplicável)
          <input maxLength={120} value={nomeSocial} onChange={(e) => setNomeSocial(e.target.value)} className={INPUT} />
        </label>

        {requireAccount && currentUser ? (
          <p className="rounded-lg bg-bg px-3.5 py-2.5 text-[12.5px] text-muted">
            Você está conectado(a) como <b>{currentUser.email}</b>. O cadastro ficará na sua conta.
          </p>
        ) : (
          <label className={LABEL}>
            E-mail
            <input
              required
              type="email"
              maxLength={160}
              autoComplete="email"
              value={email}
              readOnly={!requireAccount}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
            />
          </label>
        )}
        {precisaCriarConta && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={LABEL}>
              Crie uma senha (mín. 8 caracteres)
              <input required type="password" minLength={8} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} className={INPUT} />
            </label>
            <label className={LABEL}>
              Confirme a senha
              <input required type="password" minLength={8} autoComplete="new-password" value={confirmacaoSenha} onChange={(e) => setConfirmacaoSenha(e.target.value)} className={INPUT} />
            </label>
            <p className="text-xs text-muted sm:col-span-2">
              Com este login você acompanha o andamento do seu cadastro em “Meus pedidos”.
              Já tem conta?{" "}
              <Link href={loginHref} className="font-semibold text-primary underline">
                Entre aqui
              </Link>
              .
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={LABEL}>
            Data de nascimento
            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className={INPUT} />
          </label>
          <label className={LABEL}>
            Município
            <input required maxLength={100} autoComplete="address-level2" value={municipio} onChange={(e) => setMunicipio(e.target.value)} className={INPUT} />
          </label>
        </div>
        <label className={LABEL}>
          Território ou comunidade
          <input maxLength={120} value={territorio} onChange={(e) => setTerritorio(e.target.value)} className={INPUT} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={LABEL}>
            Telefone / WhatsApp
            <input
              type="tel"
              maxLength={40}
              autoComplete="tel"
              required={formaContato !== "E-mail"}
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className={INPUT}
            />
          </label>
          <label className={LABEL}>
            Forma preferencial de contato
            <select value={formaContato} onChange={(e) => setFormaContato(e.target.value as FormaContato)} className={INPUT}>
              {FORMAS_CONTATO.map((forma) => (
                <option key={forma} value={forma}>
                  {forma}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>2. Composição familiar</legend>
        <p className="text-xs text-muted">
          Campos com * são obrigatórios. Se algo não se aplica, escreva “Nenhum”.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={LABEL}>
            Quantas pessoas moram com você? *
            <input required maxLength={60} placeholder="Ex.: 4" value={familia.integrantes} onChange={(e) => setFamilia({ ...familia, integrantes: e.target.value })} className={INPUT} />
          </label>
          <label className={LABEL}>
            Pessoas dependentes *
            <input required maxLength={200} placeholder="Ex.: 2 filhos, mãe idosa" value={familia.dependentes} onChange={(e) => setFamilia({ ...familia, dependentes: e.target.value })} className={INPUT} />
          </label>
        </div>
        <label className={LABEL}>
          Faixa etária dos integrantes *
          <input required maxLength={300} placeholder="Ex.: 2 adultos, 1 criança de 5 anos" value={familia.faixaEtaria} onChange={(e) => setFamilia({ ...familia, faixaEtaria: e.target.value })} className={INPUT} />
        </label>
        <label className={LABEL}>
          Composição do domicílio *
          <input required maxLength={300} placeholder="Quem vive na casa e qual o parentesco" value={familia.composicaoDomiciliar} onChange={(e) => setFamilia({ ...familia, composicaoDomiciliar: e.target.value })} className={INPUT} />
        </label>
        <label className={LABEL}>
          Outras informações que considere importantes (opcional)
          <textarea maxLength={1500} value={familia.outrasInformacoes} onChange={(e) => setFamilia({ ...familia, outrasInformacoes: e.target.value })} className={`${INPUT} min-h-[80px] resize-y`} />
        </label>
      </fieldset>

      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>3. Situação socioeconômica</legend>
        <p className="text-xs text-muted">
          Todos os campos são obrigatórios. Se algo não se aplica, escreva “Nenhum”; nas listas há
          opções para preferir não informar. Essas informações são vistas só pelo Serviço Social.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField label="Situação de trabalho *" value={socio.situacaoTrabalho} options={SITUACOES_TRABALHO} onChange={(value) => setSocio({ ...socio, situacaoTrabalho: value })} />
          <SelectField label="Renda familiar mensal *" value={socio.renda} options={FAIXAS_RENDA} onChange={(value) => setSocio({ ...socio, renda: value })} />
        </div>
        <label className={LABEL}>
          Fontes de renda *
          <input required maxLength={300} placeholder="Ex.: trabalho informal, pensão" value={socio.fontesRenda} onChange={(e) => setSocio({ ...socio, fontesRenda: e.target.value })} className={INPUT} />
        </label>
        <label className={LABEL}>
          Benefícios recebidos *
          <input required maxLength={300} placeholder="Ex.: Bolsa Família, BPC ou “Nenhum”" value={socio.beneficios} onChange={(e) => setSocio({ ...socio, beneficios: e.target.value })} className={INPUT} />
        </label>
        <label className={LABEL}>
          Despesas essenciais *
          <input required maxLength={300} placeholder="Ex.: aluguel, remédios, transporte" value={socio.despesasEssenciais} onChange={(e) => setSocio({ ...socio, despesasEssenciais: e.target.value })} className={INPUT} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField label="Situação alimentar *" value={socio.situacaoAlimentar} options={SITUACOES_ALIMENTARES} onChange={(value) => setSocio({ ...socio, situacaoAlimentar: value })} />
          <SelectField label="Situação habitacional *" value={socio.situacaoHabitacional} options={SITUACOES_HABITACIONAIS} onChange={(value) => setSocio({ ...socio, situacaoHabitacional: value })} />
        </div>
      </fieldset>

      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>4. Preciso de apoio</legend>
        <p className="text-xs text-muted">Marque uma ou mais áreas.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CATEGORIAS_DEMANDA.map((categoria) => (
            <label key={categoria} className="flex items-start gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={categorias.includes(categoria)}
                onChange={(e) => toggleCategoria(categoria, e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              {categoria}
            </label>
          ))}
        </div>
        <label className={LABEL}>
          Conte o que está acontecendo
          <textarea
            required
            maxLength={5000}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Escreva com tranquilidade. Este texto é privado: só a equipe de acolhimento vê."
            className={`${INPUT} min-h-[140px] resize-y`}
          />
        </label>
        <label className="flex items-center gap-2 text-[12.5px] font-semibold text-muted">
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} className="accent-primary" />
          É uma situação urgente
        </label>
        <label className={LABEL}>
          Anexos (opcional) — total de até {MAX_UPLOAD_LABEL}
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="mt-1 w-full rounded-lg border border-dashed border-border bg-bg px-3.5 py-3 text-[12.5px]"
          />
        </label>
      </fieldset>

      <label className="flex items-start gap-2.5 rounded-lg border border-border bg-bg p-3.5 text-[12.5px]">
        <input type="checkbox" required checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} className="mt-0.5" />
        <span>
          Autorizo o tratamento dos meus dados pessoais e, quando aplicável, dados sensíveis, pela
          equipe do Serviço Social, exclusivamente para análise e acompanhamento deste
          atendimento, conforme a LGPD. Nada do que escrevo aqui é publicado; se houver proposta
          de divulgação, a equipe pedirá minha autorização específica antes.
        </span>
      </label>

      {error && (
        <p role="alert" className="text-[13px] text-urgent">
          {error}{" "}
          {emailEmUso && (
            <Link href={loginHref} className="font-semibold underline">
              Entrar
            </Link>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Enviando…" : precisaCriarConta ? "Criar conta e enviar cadastro" : "Enviar cadastro"}
      </button>
    </form>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={LABEL}>
      {label}
      <select required value={value} onChange={(e) => onChange(e.target.value)} className={INPUT}>
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
