"use client";

import { auth } from "@/lib/firebase/client";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";

const MIN_LENGTH = 8;

const inputClass =
  "rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary";

function errorMessage(code: string | undefined) {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "A senha atual está incorreta.";
    case "auth/weak-password":
      return `A nova senha é fraca demais. Use pelo menos ${MIN_LENGTH} caracteres.`;
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
    case "auth/requires-recent-login":
      return "Por segurança, saia e entre novamente antes de trocar a senha.";
    default:
      return "Não foi possível concluir. Tente novamente.";
  }
}

export function ChangePasswordForm() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return <p className="text-sm text-muted">Carregando…</p>;
  if (user === null || !user.email) {
    return (
      <p className="text-sm text-muted">
        Sua sessão do navegador expirou. Saia e entre novamente para alterar a senha.
      </p>
    );
  }

  const email = user.email;
  const hasPassword = user.providerData.some((p) => p.providerId === "password");

  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (next.length < MIN_LENGTH) {
      setError(`A nova senha deve ter pelo menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (next !== confirm) {
      setError("A confirmação não confere com a nova senha.");
      return;
    }
    if (next === current) {
      setError("A nova senha deve ser diferente da atual.");
      return;
    }
    setLoading(true);
    try {
      await reauthenticateWithCredential(user!, EmailAuthProvider.credential(email, current));
      await updatePassword(user!, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setSuccess("Senha alterada com sucesso.");
    } catch (err) {
      setError(errorMessage((err as { code?: string }).code));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendEmail() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(`Enviamos um link para ${email}. Abra-o para definir a senha (confira o spam).`);
    } catch (err) {
      setError(errorMessage((err as { code?: string }).code));
    } finally {
      setLoading(false);
    }
  }

  if (!hasPassword) {
    return (
      <div className="flex max-w-[420px] flex-col gap-3">
        <p className="text-sm text-muted">
          Sua conta entra pelo Google e ainda não tem senha. Se quiser também entrar com e-mail e senha,
          enviaremos um link para <strong>{email}</strong> para você definir uma.
        </p>
        {error && <p className="text-[13px] text-urgent">{error}</p>}
        {success && <p className="text-[13px] text-green-700">{success}</p>}
        <button
          type="button"
          onClick={handleSendEmail}
          disabled={loading}
          className="w-fit rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Enviar link para definir senha"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleChange} className="flex max-w-[420px] flex-col gap-3">
      <input
        type="password"
        required
        autoComplete="current-password"
        placeholder="Senha atual"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        className={inputClass}
      />
      <input
        type="password"
        required
        autoComplete="new-password"
        placeholder={`Nova senha (mín. ${MIN_LENGTH} caracteres)`}
        value={next}
        onChange={(e) => setNext(e.target.value)}
        className={inputClass}
      />
      <input
        type="password"
        required
        autoComplete="new-password"
        placeholder="Confirmar nova senha"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className={inputClass}
      />
      {error && <p className="text-[13px] text-urgent">{error}</p>}
      {success && <p className="text-[13px] text-green-700">{success}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Salvando…" : "Alterar senha"}
        </button>
        <button
          type="button"
          onClick={handleSendEmail}
          disabled={loading}
          className="text-[13px] text-muted underline transition hover:text-ink disabled:opacity-60"
        >
          Esqueci a senha atual
        </button>
      </div>
    </form>
  );
}
