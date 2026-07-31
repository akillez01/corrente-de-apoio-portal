export default function FinanceiroPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Financeiro — repasses</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Acesso: financeiro, admin. Botão &quot;Confirmar repasse&quot; desabilitado
        até comprovante existir; validação repetida na Cloud Function.
      </p>
    </main>
  );
}
