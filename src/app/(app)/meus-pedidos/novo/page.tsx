import { requireRole } from "@/lib/auth/session";
import { NovoPedidoForm } from "@/components/pedidos/NovoPedidoForm";

export default async function NovoPedidoPage() {
  await requireRole("requerente", "admin");
  return <NovoPedidoForm />;
}
