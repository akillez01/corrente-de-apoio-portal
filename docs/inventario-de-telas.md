


# Inventário de telas — Portal Daime Solidariedade

Estado em 2026-10-22, após a reorganização do menu pedida pelo cliente. Endereços antigos
(`/campanhas`, `/voluntarios`, `/projetos`, `/preciso-de-apoio`, `/daime-solidariedade`)
redirecionam para os novos (`next.config.mjs`).

### Páginas públicas (menu, nesta ordem)

| Menu | Rota App Router | Conteúdo |
| --- | --- | --- |
| Início | `app/[locale]/page.tsx` | Apresentação + cinco atalhos com ícones (Preciso de ajuda, Doar, Voluntariar, Projetar, Integrar) |
| O que é? | `app/[locale]/o-que-e/page.tsx` | “Nossa identidade” e os seis princípios (antes na home) |
| Preciso de Ajuda | `app/[locale]/preciso-de-ajuda/page.tsx` | Cadastro de acolhimento em 4 módulos (`AcolhimentoForm`), cria a conta do requerente |
| Doar | `app/[locale]/doar/page.tsx` | Campanhas abertas por data de publicação; detalhe em `app/[locale]/campanha/[slug]` |
| Voluntariar | `app/[locale]/voluntariar/page.tsx` | Identificação + “Posso oferecer” (`VoluntarioForm`) |
| Projetar | `app/[locale]/projetar/page.tsx`, `projetar/[slug]` | Projetos aprovados + cadastro; página própria com link de divulgação |
| Integrar | `app/[locale]/integrar/page.tsx` | Pontos do Santo Daime aprovados, por país + cadastro |
| Mulheres | `app/[locale]/mulheres/page.tsx`, `mulheres/apoio` | Iniciativas + página de suporte (Ligue 180/190, cadastro, e-mail) |
| Juventude | `app/[locale]/juventude/page.tsx` | Ações que conectam os mais antigos aos mais novos |
| Notícias | `app/[locale]/noticias/page.tsx`, `noticias/[slug]` | Matérias publicadas pelo painel + matéria legada da Fazenda São Sebastião |
| Transparência | `app/[locale]/transparencia/page.tsx` | Arrecadado e repassado por campanha, com totais |
| (fora do menu) | `app/[locale]/como-funciona/page.tsx` | Fluxo institucional |

### Área interna

| Tela | Rota | Acesso |
| --- | --- | --- |
| Meus pedidos / novo cadastro | `app/(app)/meus-pedidos`, `meus-pedidos/novo` | `requerente` |
| Serviço Social — casos e ficha | `app/(app)/servico-social`, `servico-social/[id]` | `assistente_social`, `admin` |
| Curadoria — fila e pedido (define título e meta ao aprovar) | `app/(app)/curadoria`, `curadoria/[id]` | `curador`, `admin` |
| Voluntários do Daime (diretório com filtros) | `app/(app)/voluntarios` | `curador`, `assistente_social`, `admin` |
| Financeiro — repasses | `app/(app)/financeiro` | `financeiro`, `admin` |
| Projetos e pontos (moderação) | `app/(app)/admin/moderacao` | `editor_conteudo`, `admin` |
| Notícias (criar/editar/excluir) | `app/(app)/admin/noticias`, `admin/noticias/[id]` | `editor_conteudo`, `admin` |
| Conteúdo do site (textos PT/EN) | `app/(app)/admin/conteudo` | `editor_conteudo`, `admin` |
| Publicação de campanhas | `app/(app)/admin/campanhas` | `editor_conteudo`, `admin` (UID diferente do aprovador) |
| Usuários e papéis | `app/(app)/admin/usuarios` | `admin` |
| Minha conta (senha) | `app/(app)/conta` | qualquer conta |

### Coleções Firestore usadas pelas novas telas

| Coleção | Conteúdo | Quem lê pelo cliente (`firestore.rules`) |
| --- | --- | --- |
| `requests` | Cadastro de acolhimento (módulos 1–4) | dono, `curador`, `assistente_social`, `admin` |
| `atendimentos_sociais` | Prontuário do Serviço Social (id = id do pedido) | `assistente_social`, `admin` |
| `volunteer_applications` | Cadastro de voluntários (`versao: 2` no formato novo) | ninguém (só servidor) |
| `projetos`, `pontos` | Cadastros públicos com `status` pendente/aprovado/reprovado | `editor_conteudo`, `admin` |
| `noticias` | Matérias (`rascunho`/`publicado`) | publicadas: todos; demais: `editor_conteudo`, `admin` |

## Componentes reutilizáveis identificados

- `CampaignCard` — foto/gradiente, badge de categoria, barra de progresso, valores, CTA.
- `ProgressBar` — variantes `andamento` (verde) e `concluida` (âmbar), animação de largura.
- `TransparencyTrail` — trilha vertical de 5 etapas; estados `concluido` / `atual` / `futuro`.
- `StatusChip` — mapa estado → rótulo/cores (submetido, em análise, em alinhamento, aprovado, publicado, reprovado, pendente, repassado).
- `DataTable` — grid com cabeçalho em `#F2F5F0`, linhas divididas por `#DDE6DE`.
- `Modal` — overlay `rgba(20,30,24,.55)`, card 16px, animação de entrada.
- `Toast` — confirmação de ação, canto inferior central.
- `NoticeBanner` — variantes âmbar (aviso) e verde (confirmação).
- `LangSwitcher` — PT/EN/ES.

O cabeçalho e o rodapé apresentam o contato `daimesolidariedade@gmail.com` e o link do
Instagram do portal.

## Próximas implementações

- Versão em inglês do cadastro de acolhimento, das telas internas e das notícias.
- Relatórios do Serviço Social (exportação de atendimentos por período e categoria).
- Pagamento real (Pix) nas campanhas; a rota de simulação segue bloqueada em produção.
- Envio de avisos por e-mail (Resend) e rotina de backup do Firestore.
