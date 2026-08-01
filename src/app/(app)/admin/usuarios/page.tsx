import { requireRole } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { CreateUserForm } from "@/components/admin/CreateUserForm";

export const revalidate = 0;

export default async function AdminUsuariosPage() {
  const user = await requireRole("admin");
  const users = await listUsers();

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Usuários e papéis</h1>
      <p className="mb-5 text-[13px] text-muted">
        Trocar o papel atualiza os custom claims no Firebase Auth e o registro em{" "}
        <code>users</code>. A mudança vale a partir do próximo login (ou renovação de
        token) da pessoa afetada.
      </p>

      <CreateUserForm />

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="grid grid-cols-[2fr_1.4fr_1fr] gap-3 bg-bg px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <span>Nome</span>
          <span>E-mail</span>
          <span>Papel</span>
        </div>
        {users.map((u) => (
          <div
            key={u.uid}
            className="grid grid-cols-[2fr_1.4fr_1fr] items-center gap-3 border-b border-border px-4.5 py-3 text-[13.5px] last:border-b-0"
          >
            <span className="font-semibold">{u.nome}</span>
            <span className="font-mono text-[12px] text-muted">{u.email}</span>
            <RoleSelect uid={u.uid} role={u.role} disabled={u.uid === user.uid} />
          </div>
        ))}
      </div>
    </div>
  );
}
