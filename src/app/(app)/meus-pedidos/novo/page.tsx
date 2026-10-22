import { requireRole } from "@/lib/auth/session";
import { AcolhimentoForm } from "@/components/pedidos/AcolhimentoForm";

export default async function NovoPedidoPage() {
  const user = await requireRole("requerente", "admin");
  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="font-serif text-2xl font-semibold">Novo cadastro de acolhimento</h1>
      <p className="mb-5 mt-1 text-[13px] text-muted">
        Preencha o cadastro e aguarde o retorno do Serviço Social. Nada do que você escrever
        aqui é publicado.
      </p>
      <AcolhimentoForm
        requireAccount={false}
        initialName={user.nome ?? ""}
        initialEmail={user.email ?? ""}
        loginHref="/login?next=%2Fmeus-pedidos%2Fnovo"
      />
    </div>
  );
}
