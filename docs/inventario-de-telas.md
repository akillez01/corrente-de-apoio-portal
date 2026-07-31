# Inventário de telas — do protótipo para o Next.js

| Tela no protótipo | Rota sugerida (App Router) | Acesso | Notas de implementação |
|---|---|---|---|
| Portal público | `app/[locale]/page.tsx` | público | Lista `campaigns` com `status in [publicado, meta_atingida, prestacao_publicada]`. Cache ISR + revalidação por webhook. |
| Campanha (detalhe) | `app/[locale]/campanha/[slug]/page.tsx` | público | Progresso em tempo real via listener no doc da campanha. Botões Pix/PayPal criam a preferência no PSP. |
| Prestação de contas | seção da mesma rota, quando `status = prestacao_publicada` | público | Extrato + comprovante do `transfers` correspondente. |
| Como funciona | `app/[locale]/como-funciona/page.tsx` | público | Conteúdo estático traduzido. |
| Curadoria — fila | `app/(app)/curadoria/page.tsx` | `curador`, `admin` | Query em `requests` ordenada por urgência e data. |
| Curadoria — pedido | `app/(app)/curadoria/[id]/page.tsx` (modal no protótipo) | `curador`, `admin` | Anexos por signed URL de curta duração. Texto público é campo separado do texto bruto. |
| Financeiro — repasses | `app/(app)/financeiro/page.tsx` | `financeiro`, `admin` | Botão "Confirmar repasse" desabilitado até `comprovante` existir; validação repetida na Cloud Function. |
| Dashboard do requerente | `app/(app)/meus-pedidos/page.tsx` | `requerente` | Não existe no protótipo — desenhar na Fase 1. |
| Admin de usuários | `app/(app)/admin/usuarios/page.tsx` | `admin` | Não existe no protótipo — desenhar na Fase 1. |

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

## Pendências de design para a Fase 1

- Formulário de submissão de pedido (com consentimento LGPD e upload de anexos)
- Dashboard do requerente (acompanhamento do pedido e das mensagens da curadoria)
- Admin de usuários e papéis
- Estados vazios, erro e carregamento de cada tela
- Versões en/es das strings
