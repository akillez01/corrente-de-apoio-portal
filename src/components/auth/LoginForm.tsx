"use client";

import { establishSession } from "@/lib/auth/clientSession";
import { auth, googleProvider } from "@/lib/firebase/client";
import type { Role } from "@/lib/types/domain";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, type User } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const LANDING_BY_ROLE: Record<Role, string> = {
  curador: "/curadoria",
  assistente_social: "/servico-social",
  financeiro: "/financeiro",
  editor_conteudo: "/admin/conteudo",
  admin: "/admin/usuarios",
  requerente: "/meus-pedidos",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const erro = params.get("erro");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    erro === "acesso-negado" ? "Você não tem papel autorizado para acessar essa área." : null,
  );

  async function finishSignIn(user: User) {
    const role = await establishSession(user);
    router.push(next ?? (role ? LANDING_BY_ROLE[role] : "/pt"));
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await finishSignIn(credential.user);
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  // Mensagem genérica de propósito: não revela se o e-mail tem cadastro.
  async function handleForgotPassword() {
    setError(null);
    setInfo(null);
    if (!email) {
      setError("Informe seu e-mail acima para receber o link de redefinição.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      if ((err as { code?: string }).code === "auth/too-many-requests") {
        setError("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
        return;
      }
    }
    setInfo("Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha. Confira o spam.");
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await finishSignIn(credential.user);
    } catch {
      setError("Não foi possível entrar com Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-12">
      <Link href="/pt" className="mb-6 w-fit text-[13px] text-muted transition hover:text-ink">
        ← Voltar ao portal
      </Link>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Entrar</h1>
      <p className="mb-6 text-sm text-muted">Acesso à área interna — Daime Solidariedade</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        {error && <p className="text-[13px] text-urgent">{error}</p>}
        {info && <p className="text-[13px] text-green-700">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="w-fit text-[13px] text-muted underline transition hover:text-ink"
        >
          Esqueci minha senha
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="flex items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-primary disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.4 0-13.8 4.1-17.1 10.1z" />
          <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.1 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.9 40.4 16.4 45 24 45z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.6 5.4C41.5 36 45 30.8 45 24c0-1.4-.1-2.5-.4-3.5z" />
        </svg>
        {googleLoading ? "Entrando…" : "Entrar com Google"}
      </button>
      <p className="mt-3 text-center text-[11.5px] text-muted">
        Novo por aqui? Entrar com Google cria seu cadastro automaticamente.
      </p>
    </div>
  );
}
