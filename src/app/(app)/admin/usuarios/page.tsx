import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { requireRole } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";
import { getAdminDb } from "@/lib/firebase/admin";
import { formatBRL } from "@/lib/format";
import type { Campaign, Donation, RequestStatus, Transfer } from "@/lib/types/domain";
import { getRequestSummaries, type RequestSummary } from "@/lib/data/requests";
import { matchesSearch, paginate, param, type SearchParams } from "@/lib/panels/filters";
import {
  FILTER_INPUT,
  FILTER_LABEL,
  FilterForm,
  Pagination,
  ResultSummary,
  SelectFilter,
} from "@/components/panels/PanelControls";

export const revalidate = 0;

function toRoleCount(users: Awaited<ReturnType<typeof listUsers>>) {
  return users.reduce(
    (acc, user) => {
      acc[user.role] += 1;
      return acc;
    },
    { requerente: 0, curador: 0, assistente_social: 0, financeiro: 0, editor_conteudo: 0, admin: 0 },
  );
}

function toRequestStatusCount(requests: RequestSummary[]) {
  return requests.reduce(
    (acc, request) => {
      acc[request.status] = (acc[request.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<RequestStatus, number>,
  );
}

export default async function AdminUsuariosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireRole("admin");
  const params = await searchParams;
  const busca = param(params, "q");
  const papel = param(params, "papel");
  const users = await listUsers();
  const usersPage = paginate(
    users.filter((u) => (!papel || u.role === papel) && matchesSearch(busca, [u.nome, u.email])),
    param(params, "pagina"),
  );

  // Só os campos usados nos indicadores, para o painel continuar leve com muitos registros.
  const [requests, campaignsSnapshot, donationsSnapshot, transfersSnapshot] = await Promise.all([
    getRequestSummaries(),
    getAdminDb().collection("campaigns").select("titulo", "status", "arrecadado").get(),
    getAdminDb().collection("donations").select("valor").get(),
    getAdminDb().collection("transfers").select("valor").get(),
  ]);

  const campaigns = campaignsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Campaign);
  const donations = donationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Donation);
  const transfers = transfersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Transfer);

  const roles = toRoleCount(users);
  const requestStatus = toRequestStatusCount(requests);
  const campaignsPublicadas = campaigns.filter((campaign) => campaign.status === "publicado").length;
  const campanhasPrestacao = campaigns.filter(
    (campaign) => campaign.status === "prestacao_publicada" || campaign.status === "repassado",
  ).length;
  const arrecadadoTotal = campaigns.reduce((acc, campaign) => acc + campaign.arrecadado, 0);
  const repassadoTotal = transfers.reduce((acc, transfer) => acc + transfer.valor, 0);
  const doacoesTotal = donations.reduce((acc, donation) => acc + donation.valor, 0);
  const pedidosUrgentes = requests.filter((request) => request.urgente).length;

  const latestRequests = [...requests]
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .slice(0, 5);
  const topCampaigns = [...campaigns]
    .sort((a, b) => b.arrecadado - a.arrecadado)
    .slice(0, 5);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Painel geral do sistema</h1>
      <p className="mb-5 text-[13px] text-muted">
        Visão consolidada para admin com dados de todas as áreas: requerente, curadoria,
        financeiro e gestão de usuários.
      </p>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Usuarios" value={String(users.length)} hint={`${roles.admin} admin(s)`} />
        <KpiCard label="Pedidos" value={String(requests.length)} hint={`${pedidosUrgentes} urgente(s)`} />
        <KpiCard label="Campanhas" value={String(campaigns.length)} hint={`${campaignsPublicadas} publicadas`} />
        <KpiCard label="Doacoes registradas" value={`R$ ${formatBRL(doacoesTotal)}`} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Arrecadado total" value={`R$ ${formatBRL(arrecadadoTotal)}`} />
        <KpiCard label="Repassado total" value={`R$ ${formatBRL(repassadoTotal)}`} />
        <KpiCard label="Prestacao publicada" value={String(campanhasPrestacao)} />
        <KpiCard label="Total de repasses" value={String(transfers.length)} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="mb-3 font-serif text-lg font-semibold">Usuarios por papel</h2>
          <div className="grid grid-cols-2 gap-2 text-[13px]">
            <div className="rounded-lg border border-border bg-bg p-3">Requerente: {roles.requerente}</div>
            <div className="rounded-lg border border-border bg-bg p-3">Curadoria: {roles.curador}</div>
            <div className="rounded-lg border border-border bg-bg p-3">Serviço Social: {roles.assistente_social}</div>
            <div className="rounded-lg border border-border bg-bg p-3">Financeiro: {roles.financeiro}</div>
            <div className="rounded-lg border border-border bg-bg p-3">Editor de conteúdo: {roles.editor_conteudo}</div>
            <div className="rounded-lg border border-border bg-bg p-3">Admin: {roles.admin}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="mb-3 font-serif text-lg font-semibold">Pedidos por status</h2>
          <div className="grid grid-cols-2 gap-2 text-[13px]">
            <div className="rounded-lg border border-border bg-bg p-3">
              Submetido: {requestStatus.submetido ?? 0}
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              Em analise: {requestStatus.em_analise ?? 0}
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              Em alinhamento: {requestStatus.em_alinhamento ?? 0}
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              Aprovado: {requestStatus.aprovado ?? 0}
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              Reprovado: {requestStatus.reprovado ?? 0}
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              Arquivado: {requestStatus.arquivado ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="mb-3 font-serif text-lg font-semibold">Ultimos pedidos enviados</h2>
          {latestRequests.length === 0 ? (
            <p className="text-[13px] text-muted">Nenhum pedido registrado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {latestRequests.map((request) => (
                <div key={request.id} className="rounded-lg border border-border bg-bg p-3 text-[13px]">
                  <div className="font-semibold">{request.titulo}</div>
                  <div className="mt-0.5 text-muted">
                    {request.requerenteNome} · {new Date(request.criadoEm).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="mb-3 font-serif text-lg font-semibold">Top campanhas por arrecadacao</h2>
          {topCampaigns.length === 0 ? (
            <p className="text-[13px] text-muted">Nenhuma campanha registrada.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topCampaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-lg border border-border bg-bg p-3 text-[13px]">
                  <div className="font-semibold">{campaign.titulo}</div>
                  <div className="mt-0.5 text-muted">
                    {campaign.status} · R$ {formatBRL(campaign.arrecadado)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-1 font-serif text-2xl font-semibold">Usuarios e papeis</h2>
      <p className="mb-5 text-[13px] text-muted">
        Trocar o papel atualiza os custom claims no Firebase Auth e o registro em{" "}
        <code>users</code>. A mudança vale a partir do próximo login (ou renovação de
        token) da pessoa afetada.
      </p>

      <CreateUserForm />

      <FilterForm action="/admin/usuarios" hasFilters={Boolean(busca || papel)}>
        <label className={`${FILTER_LABEL} sm:col-span-2`}>
          Buscar usuário
          <input name="q" defaultValue={busca} placeholder="Nome ou e-mail" className={FILTER_INPUT} />
        </label>
        <SelectFilter
          name="papel"
          label="Papel"
          value={papel}
          options={[
            ["requerente", "Requerente"],
            ["assistente_social", "Assistente social"],
            ["curador", "Curadoria"],
            ["financeiro", "Financeiro"],
            ["editor_conteudo", "Editor de conteúdo"],
            ["admin", "Admin"],
          ]}
        />
      </FilterForm>

      <ResultSummary page={usersPage} totalAll={users.length} noun="usuário(s)" />

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <div className="min-w-[760px]">
        <div className="grid grid-cols-[2fr_1.4fr_1.2fr_auto] gap-3 bg-bg px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <span>Nome</span>
          <span>E-mail</span>
          <span>Papel</span>
          <span>Acoes</span>
        </div>
        {usersPage.items.map((u) => (
          <div
            key={u.uid}
            className="grid grid-cols-[2fr_1.4fr_1.2fr_auto] items-center gap-3 border-b border-border px-4.5 py-3 text-[13.5px] last:border-b-0"
          >
            <span className="font-semibold">{u.nome}</span>
            <span className="font-mono text-[12px] text-muted">{u.email}</span>
            <RoleSelect uid={u.uid} role={u.role} disabled={u.uid === user.uid} />
            <div className="flex flex-wrap items-center gap-2">
              <ResetPasswordButton uid={u.uid} nome={u.nome} disabled={u.uid === user.uid} />
              <DeleteUserButton uid={u.uid} nome={u.nome} disabled={u.uid === user.uid} />
            </div>
          </div>
        ))}
        </div>
      </div>

      <Pagination action="/admin/usuarios" params={params} page={usersPage} />
    </div>
  );
}
