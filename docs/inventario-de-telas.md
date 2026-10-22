


# Inventário de telas — Portal Daime Solidariedade

| Tela / aba | Rota App Router | Acesso | Estado |
| --- | --- | --- | --- |
| Início | `app/[locale]/page.tsx` | Público | Apresentação do portal e seção “Nossa identidade” com os seis princípios/orientações, abaixo do destaque principal; CTA para integrar a rede. |
| Preciso de apoio | `app/[locale]/preciso-de-apoio/page.tsx` | Público; pedido exige login | Implementado; CTA segue para o formulário autenticado já existente. |
| Voluntariado | `app/[locale]/voluntarios/page.tsx` | Público | Formulário de voluntariado existente, integrado à navegação. |
| Novo pedido de apoio | `app/(app)/meus-pedidos/novo/page.tsx` | Requerente autenticado | Formulário completo com dados de contato, categoria, meta, prazo, urgência, descrição, anexos até 4 MB e consentimento LGPD; detalhes em `docs/arquitetura-daime-solidariedade.md`. |
| Campanhas | `app/[locale]/campanhas/page.tsx` | Público | Implementado; lista apenas campanhas públicas existentes e mostra estado vazio. |
| Campanha (detalhe) | `app/[locale]/campanha/[slug]/page.tsx` | Público | Página de campanha existente. Verificar disponibilidade do pagamento real antes de ativá-lo. |
| Como funciona | `app/[locale]/como-funciona/page.tsx` | Público | Implementado com fluxo institucional, sem afirmar capacidades ainda não comprovadas. |
| Projetos | `app/[locale]/projetos/page.tsx` | Público | Página de apresentação; cadastro digital ainda pendente. |
| Mulheres | `app/[locale]/mulheres/page.tsx` | Público | Frente apresentada como em construção. |
| Juventude | `app/[locale]/juventude/page.tsx` | Público | Frente apresentada como em construção, com nota de salvaguardas. |
| Transparência | `app/[locale]/transparencia/page.tsx` | Público | Compromissos e ligação a campanhas; não inventa métricas nem auditorias. |
| Curadoria — fila | `app/(app)/curadoria/page.tsx` | `curador`, `admin` | Área autenticada existente. |
| Curadoria — pedido | `app/(app)/curadoria/[id]/page.tsx` | `curador`, `admin` | Área autenticada existente. |
| Financeiro — repasses | `app/(app)/financeiro/page.tsx` | `financeiro`, `admin` | Área financeira existente. |
| Dashboard do requerente | `app/(app)/meus-pedidos/page.tsx` | `requerente` | Área autenticada existente. |
| Admin de usuários | `app/(app)/admin/usuarios/page.tsx` | `admin` | Área administrativa existente. |
| Editor de conteúdo | `app/(app)/admin/conteudo/page.tsx` | `editor_conteudo`, `admin` | Edita textos e imagens das páginas públicas em PT/EN; formulários e conteúdo interno ficam protegidos. |
| Publicação de campanhas | `app/(app)/admin/campanhas/page.tsx` | `editor_conteudo`, `admin` | Fila de campanhas já aprovadas pela curadoria; publicação exige UID diferente do aprovador. |

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

- Fluxo de atendimento do Serviço Social com registro técnico segregado e permissões próprias.
- Proposta e gestão de projetos, Escritório de Projetos e oportunidades.
- Governança e aprovação institucional configuráveis e auditáveis.
- Revisão de segurança para coleta, exposição e retenção de dados no cadastro de voluntariado.
- Teste funcional autenticado das novas rotas de edição e publicação; atribuição da role no Firebase.
- Prestação de contas, painel financeiro e auditoria independente conforme decisões formais.
- Traduções completas para inglês; rotas de campanha e comunicação existentes ainda precisam
  de revisão de consistência com a nova identidade.
