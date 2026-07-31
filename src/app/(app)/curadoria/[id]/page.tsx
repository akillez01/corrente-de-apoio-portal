export default function CuradoriaPedidoPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Curadoria — pedido {params.id}</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Acesso: curador, admin. Anexos por signed URL de curta duração; texto
        público é campo separado do texto bruto.
      </p>
    </main>
  );
}
