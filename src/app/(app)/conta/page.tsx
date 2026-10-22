import { getSessionUser } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default async function ContaPage() {
  const user = await getSessionUser();

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Minha conta</h1>
      <p className="mb-6 text-sm text-muted">{user?.nome ?? user?.email}</p>
      <h2 className="mb-3 text-base font-semibold">Alterar senha</h2>
      <ChangePasswordForm />
    </div>
  );
}
