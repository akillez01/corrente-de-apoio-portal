export default function CampanhaPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <main className="p-8">
      <h1 className="font-serif text-3xl">Campanha: {params.slug}</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Detalhe da campanha — progresso em tempo real, linha de transparência,
        e prestação de contas quando publicada.
      </p>
    </main>
  );
}
