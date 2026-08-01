# Nota de arquitetura e conformidade — Corrente de Apoio

**Propósito:** registrar o racional por trás das decisões de arquitetura e conformidade
(custódia, LGPD, transparência, papéis, stack) e o estado real de implementação de cada uma,
com referência ao código-fonte. Documento de apoio para uma eventual auditoria — não substitui
`especificacao-tecnica.md` (o "o quê"/"como"), complementa com o "por quê" e o "onde está".

**Origem:** consolidação de uma revisão de arquitetura sobre a proposta original do portal.
**Última atualização:** 2026-07-31.

---

## 1. O sistema nunca custodia dinheiro

**Princípio.** O portal registra e exibe; quem movimenta valores é o PSP (Pix via Mercado
Pago; PayPal para o exterior), direto na conta institucional. O progresso da campanha é
alimentado por webhook do PSP, não por lançamento manual.

**Por quê.** Custódia própria de dinheiro de terceiros implica regulação financeira,
superfície de fraude muito maior e responsabilidade civil desproporcional para uma instituição
sem estrutura de compliance financeiro. Delegar a custódia ao PSP elimina essa categoria de
risco inteira.

**Implementação.**
- Nenhum dado de cartão ou chave Pix de doador é armazenado (`docs/especificacao-tecnica.md §1, §5.6`).
- `donations` e `campaigns.arrecadado` só são graváveis pelo Admin SDK — o cliente nunca
  escreve neles (`firestore.rules`, regras `donations` e `campaigns`: `allow write: if false`).
- O caminho de escrita real (webhook do PSP → Cloud Function/rota de API → transação
  atomizando `donations` + incremento de `campaigns.arrecadado` + `audit_log`) está prototipado
  em `src/app/api/dev/simular-doacao/route.ts`, mas **hard-travado ao Firestore Emulator**
  (`if (!process.env.FIRESTORE_EMULATOR_HOST) return 403`) — nunca escreve em projeto real.

**Status: parcial.** O modelo de custódia (nunca-custódia) está corretamente refletido nas
regras de segurança e no desenho de dados. **O webhook real do Mercado Pago/PayPal ainda não
foi implementado** — hoje só existe o simulador de desenvolvimento acima. Sem isso, nenhuma
doação real incrementa `arrecadado` em produção. É o item de maior prioridade antes de aceitar
doações de verdade.

---

## 2. LGPD e dados sensíveis

**Princípio.** Pedido de ajuda para tratamento de saúde envolve dado sensível (Lei 13.709/2018,
art. 11). O sistema precisa de (a) consentimento explícito do requerente, (b) separação clara
entre o que o curador vê (laudos, documentos) e o que vai ao ar (texto público reescrito), e
(c) controle de acesso a anexos sensíveis.

**Por quê.** Publicar laudo médico (potencialmente de uma criança) em página pública seria
falha grave de proteção de dados e dano à credibilidade institucional. A curadoria humana é o
*gate* obrigatório que impede isso — não é burocracia, é o controle de LGPD do sistema.

**Implementação.**
- `requests` (pedido bruto, com anexos e descrição original) é uma coleção **privada**;
  `campaigns` (texto público) é uma versão **separada**, escrita pelo curador — nunca há
  publicação automática do texto do requerente (`src/lib/types/domain.ts`, `SupportRequest` vs
  `Campaign`; `firestore.rules` regra `requests`: leitura restrita ao próprio requerente,
  curador ou admin).
- Consentimento registrado com timestamp: `SupportRequest.consentimentoLgpdEm`.
- Anexos sensíveis (laudos, documentos) ficam em disco no servidor de aplicação — **não** em
  Storage público — servidos só por rota autenticada que confere papel a cada requisição
  (`src/app/api/anexos/[...path]/route.ts`: exige sessão válida e `role === "curador" | "admin"`
  ou ser o próprio requerente; `Cache-Control: private, no-store`).
- Mesma lógica para comprovantes de repasse (`src/app/api/comprovantes/[...path]/route.ts`).

**Status: implementado no MVP.** O gate de curadoria, a separação pedido/campanha e o controle
de acesso a anexos estão no código, não só na especificação. **Pendente:** política de retenção
com prazo de expurgo automático (mencionada na especificação, `§5.4`) ainda não tem rotina
implementada — hoje os dados ficam retidos indefinidamente.

---

## 3. Transparência como funcionalidade central

**Princípio.** Cada campanha tem página pública de prestação de contas: total arrecadado
(via webhook, não lançamento manual), data do repasse, comprovante anexado pelo financeiro.
Doador anônimo por padrão.

**Por quê.** Transparência auditável é o que permite compliance de empresas doadoras aceitarem
a doação institucional — sem isso, o portal não destrava doação corporativa, que é um dos
objetivos declarados do projeto.

**Implementação.**
- `transfers` só fica público quando a campanha correspondente atinge o status
  `prestacao_publicada` (`firestore.rules`, regra `transfers`).
- Confirmação de repasse **exige comprovante anexado** — a rota rejeita a requisição sem
  arquivo (`src/app/api/financeiro/[campaignId]/route.ts`: `if (!isFile(comprovante) ||
  comprovante.size === 0) return 400`). Isso satisfaz diretamente o critério de aceite
  "impossível marcar `repassado` sem comprovante" (`especificacao-tecnica.md §8`).
- **Segregação de função aplicada em código, não só documentada:** a mesma rota rejeita a
  confirmação de repasse se `campaign.aprovadoPorUid === user.uid` — quem aprovou a campanha
  não pode confirmar o próprio repasse (`src/app/api/financeiro/[campaignId]/route.ts`, linhas
  25–30).
- Doação anônima por padrão: `Donation.anonimo`, calculado a partir da ausência de nome
  informado (ver simulador de webhook, campo `anonimo: !nome`).
- `audit_log`: toda transição relevante grava ator, timestamp e detalhes
  (`src/lib/audit.ts`). **Divergência da especificação:** o desenho original (`§4`) previa cada
  entrada guardando o hash do registro anterior (cadeia de hashes); a implementação atual
  (`appendAuditLog`) grava só `{ tipo, ator, alvo, detalhes, timestamp }`, **sem
  encadeamento de hash**. A âncora criptográfica periódica já era Fase 2 por decisão explícita
  (`§7`); mas o encadeamento básico de hash estava desenhado como parte do MVP e ainda não foi
  implementado — vale decidir conscientemente se entra antes de uma auditoria externa.

**Status: majoritariamente implementado**, com a ressalva do hash-chaining acima.

---

## 4. Multilíngue desde o modelo de dados

**Princípio.** "Irmandades do mundo inteiro" implica pt/en/es no mínimo, com i18n desenhado
desde o início — retrofit depois é caro.

**Implementação atual.** `src/lib/i18n/config.ts` define `locales = ["pt"]` — **só
português está configurado hoje**. O roteamento por `[locale]` já existe na estrutura de
pastas (`src/app/[locale]/...`), o que confirma que o *modelo* foi desenhado para
multilíngue, mas `en`/`es` são Fase 2 por decisão explícita já registrada
(`especificacao-tecnica.md §7`) e não foram implementados.

**Status: modelo pronto, conteúdo pendente (Fase 2, como planejado).**

---

## 5. Papéis e segregação de função

**Princípio.** `requerente`, `curador`, `financeiro`, `admin` — curador aprova conteúdo,
financeiro confirma repasse, ninguém acumula os dois poderes na mesma campanha.

**Implementação.**
- RBAC via custom claims do Firebase Auth (`role`), verificado em toda rota sensível via
  `requireRole`/`getSessionUser` (`src/lib/auth/session.ts`) e nas Firestore Rules
  (`hasRole()`/`isAdmin()` em `firestore.rules`).
- Concessão de papel é ação exclusiva de admin: `PATCH /api/admin/usuarios/[uid]` verifica
  `user.role === "admin"` antes de alterar claim + documento (`src/app/api/admin/usuarios/
  [uid]/route.ts`).
- **Autocadastro é propositalmente limitado.** Login por e-mail/senha ou Google cria conta
  nova automaticamente, mas **só com o papel `requerente`** — é o único papel
  auto-atribuível (`src/app/api/auth/session/route.ts`: provisiona `role: "requerente"` no
  primeiro login de qualquer conta sem claim de papel ainda). Curador, financeiro e admin só
  são concedidos manualmente pela tela `/admin/usuarios`, seja promovendo uma conta existente
  (`RoleSelect`) seja criando a conta já com o papel definido (`POST /api/admin/usuarios`,
  `src/components/admin/CreateUserForm.tsx`) — isso é decisão de produto tomada nesta sessão,
  não estava na especificação original, e vale registrar aqui por ser relevante para a postura
  de segurança: **ninguém se autopromove a papel privilegiado.**
- Segregação de função aprovação/repasse: ver seção 3 acima (verificação em código, não só
  processo).

**Status: implementado e mais restritivo que a especificação original** (a especificação não
detalhava a política de autocadastro; a implementação optou pelo desenho mais seguro).

---

## 6. Stack e decisões de infraestrutura

| Decisão | Razão | Status |
|---|---|---|
| Next.js App Router, SSR real (não export estático) | Server Components leem cookie de sessão, rotas de API fazem upload autenticado — precisa de servidor Node vivo, não só arquivos estáticos | Implementado; rodando via custom `server.js` sob Phusion Passenger no Plesk (não Cloud Run/Vercel como cogitado inicialmente — decisão de infra tomada por já haver servidor Plesk disponível) |
| Firebase Auth (custom claims) + Firestore | Aproveita domínio já existente da equipe em Firebase/GCP; custo próximo de zero em baixa escala | Implementado, projeto `corrente-de-apoio` em produção |
| Anexos sensíveis em disco do servidor, não Firebase Storage | Manter dado de saúde sob infraestrutura da própria instituição; evitar depender do plano pago (Blaze) só por causa do Storage | Implementado (`src/lib/storage/localStorage.ts`) |
| Firebase App Check | Reduzir abuso de API por clientes não confiáveis | **Não implementado ainda** — mencionado na especificação (`§1`), não encontrado no código atual |
| Cloud Functions para webhook de pagamento | Isolamento e escalabilidade da automação | **Substituído por rota de API Next.js** (`src/app/api/dev/simular-doacao`, ainda só dev) — decisão pragmática dado que a aplicação já roda como servidor Node persistente; não há Cloud Function real hoje |

---

## 7. Tabela-resumo de rastreabilidade

| Requisito | Evidência no código | Status |
|---|---|---|
| Impossível publicar campanha sem aprovação de curador | `campaigns` só é criada a partir de `requests` pelo fluxo de curadoria (`src/app/api/curadoria/[id]/route.ts`); `firestore.rules` bloqueia escrita direta do cliente | ✅ |
| Impossível marcar `repassado` sem comprovante | `src/app/api/financeiro/[campaignId]/route.ts`, validação de arquivo obrigatório | ✅ |
| Segregação aprovação × repasse | Mesma rota, comparação `aprovadoPorUid` × `user.uid` | ✅ |
| Nenhum anexo sensível sem autenticação e papel correto | `src/app/api/anexos/[...path]/route.ts`, `src/app/api/comprovantes/[...path]/route.ts` | ✅ |
| Cliente nunca escreve `arrecadado`/`donations`/`transfers`/`audit_log` | `firestore.rules` | ✅ |
| Progresso reflete webhook em <1min | Webhook real do PSP não existe ainda; só simulador em dev | ❌ pendente |
| `audit_log` com hash encadeado | `src/lib/audit.ts` grava sem hash do registro anterior | ❌ pendente |
| App Check ativo em produção | Não encontrado no código | ❌ pendente |
| Retenção/expurgo de dados sensíveis com prazo | Não implementado | ❌ pendente |
| en/es | `locales = ["pt"]` | ⏳ Fase 2, como planejado |
| Firestore Rules testadas com emulador | Não encontrado suite de testes de regra no repositório | ❌ pendente |
| Autocadastro nunca concede papel privilegiado | `src/app/api/auth/session/route.ts` | ✅ (mais restritivo que a spec original) |

---

## 8. Lacunas conhecidas, em ordem de prioridade para uma auditoria

1. **Webhook real de pagamento (Mercado Pago Pix)** — hoje só existe o simulador de dev.
   Sem isso o sistema não recebe doação real.
2. **App Check** — especificado, não implementado.
3. **Testes automatizados das Firestore Rules** — especificado como critério de aceite
   (`§8`), não encontrado no repositório.
4. **Hash-chaining do `audit_log`** — desenhado na especificação (`§4`), implementação atual
   não encadeia.
5. **Política de retenção/expurgo de dado sensível** — mencionada, sem rotina implementada.
6. Nenhum backup automatizado configurado no servidor de produção (registrado também no
   inventário de infraestrutura, fora deste repositório).
