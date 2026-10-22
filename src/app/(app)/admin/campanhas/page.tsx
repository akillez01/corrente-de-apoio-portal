import { CampaignPublicationQueue } from "@/components/admin/CampaignPublicationQueue";
import { requireRole } from "@/lib/auth/session";
import { getCampaignsAwaitingPublication } from "@/lib/data/campaigns";

export const revalidate = 0;

export default async function AdminCampanhasPage() {
  const user = await requireRole("editor_conteudo", "admin");
  const campaigns = await getCampaignsAwaitingPublication();

  return (
    <div>
      <h1 className="mb-2 font-serif text-2xl font-semibold">Publicação de campanhas</h1>
      <p className="mb-5 max-w-3xl text-sm leading-6 text-muted">
        Esta fila mostra somente campanhas que já foram aprovadas pela curadoria. A publicação
        é uma etapa separada, e a conta que publica deve ser diferente da conta que aprovou.
        A campanha só aparece publicamente depois desta ação.
      </p>
      <CampaignPublicationQueue campaigns={campaigns} userId={user.uid} />
    </div>
  );
}
