# Especificação técnica — Corrente de Apoio

## 1. Stack

- Next.js 14+ (App Router), TypeScript, Tailwind, rodando como app Node.js (SSR real, não
  export estático — Server Components leem cookie de sessão, rotas de API fazem upload de
  arquivo e escrita autenticada via Admin SDK)
- Firebase: Auth (custom claims para papéis), Firestore, Cloud Functions
- Anexos e comprovantes (laudos, documentos sensíveis, comprovantes de repasse): disco local
  no servidor de aplicação, atrás de rotas autenticadas que checam papel a cada request —
  não Firebase Storage. Decisão: manter dados sensíveis de saúde sob a infraestrutura da
  própria instituição (LGPD) e evitar depender do plano pago (Blaze) só por causa do Storage.
  Ver `src/lib/storage/localStorage.ts`.
- Firebase App Check ativo em produção (todas as calls)
- Pagamentos por webhook: Mercado Pago (Pix) e PayPal (internacional)
- i18n: pt-BR (padrão), en, es — strings externalizadas desde o início

**O sistema nunca custodia dinheiro nem armazena dados de cartão.** As doações vão
direto para a conta institucional no PSP; os webhooks apenas atualizam o progresso.

## 2. Papéis (RBAC via custom claims)

| Papel | Pode |
|---|---|
| `requerente` | Criar e acompanhar os próprios pedidos |
| `curador` | Triagem, edição do texto público, aprovação/reprovação, contato |
| `financeiro` | Confirmar repasses, anexar comprovantes, fechar campanhas |
| `admin` | Gestão de usuários e papéis |

**Segregação de função:** quem aprova a campanha não pode ser quem confirma o repasse.
Validar na Cloud Function comparando `campaign.aprovadoPor` com `auth.uid` do confirmante.

## 3. Máquina de estados da campanha

```
rascunho → submetido → em_analise → em_alinhamento → aprovado → publicado
  → meta_atingida | prazo_encerrado → repasse_pendente → repassado
  → prestacao_publicada → encerrado
```

Qualquer estado anterior a `publicado` pode ir para `reprovado` ou `arquivado`.
Toda transição grava em `audit_log` (ator, timestamp, hash do registro anterior).

## 4. Modelo de dados (Firestore)

- **`users`** — perfil, papel, idioma.
- **`requests`** (pedido bruto, **privado**) — descrição, categoria, meta, prazo, urgência,
  anexos sensíveis (referência ao Storage), histórico de contato da curadoria,
  consentimento LGPD com timestamp.
- **`campaigns`** (versão **pública**, criada pelo curador a partir do request) — título,
  texto público revisado, meta, `arrecadado` (só Cloud Function escreve), prazo, status,
  mídia pública aprovada, traduções, `aprovadoPor`.
- **`donations`** — valor, moeda, método (`pix` | `paypal`), id externo do PSP, timestamp,
  anônimo por padrão (nome opcional).
- **`transfers`** — campanha, valor, data, comprovante (Storage), `confirmadoPor`.
- **`audit_log`** — append-only; toda transição de estado e ação administrativa com ator,
  timestamp e hash do registro anterior (cadeia de hashes).

## 5. Segurança e LGPD

1. Anexos de `requests` em disco no servidor de aplicação, fora do diretório público,
   servidos só por rota autenticada que checa papel (curador/admin) ou o próprio
   requerente a cada acesso. Nunca públicos.
2. Firestore Rules: o cliente **jamais** escreve em `campaigns.arrecadado`, `donations`,
   `transfers` ou `audit_log` — apenas Cloud Functions (Admin SDK).
3. Webhooks validam assinatura do PSP e são idempotentes (id externo único).
4. Dados de saúde como sensíveis: consentimento explícito no formulário, texto público
   sempre reescrito pelo curador (nunca publicação automática do texto do requerente),
   retenção com política de expurgo configurável.
5. Rate limiting na submissão de pedidos; App Check em todas as calls.
6. Nenhum dado de pagamento (cartão, chave Pix do doador) armazenado.

## 6. Automações (Cloud Functions)

- Webhook Pix/PayPal → registra doação, atualiza `arrecadado`, grava `audit_log`
- Notificações por e-mail nas transições de estado (requerente e equipe)
- Encerramento automático no prazo ou na meta
- Geração da página de prestação de contas ao confirmar repasse
- Extrato consolidado por campanha exportável em CSV/PDF para o financeiro

## 7. Entrega em fases

**Fase 1 (MVP):** fluxo completo com Pix via Mercado Pago, papéis, curadoria, prestação de
contas, pt-BR.
**Fase 2:** PayPal, en/es, notificações WhatsApp, âncora criptográfica periódica do
`audit_log`. *Não implementar a Fase 2 sem pedido explícito.*

## 8. Critérios de aceite

- [ ] Impossível publicar campanha sem aprovação de curador
- [ ] Impossível marcar `repassado` sem comprovante anexado
- [ ] Progresso da campanha reflete o webhook em menos de 1 min
- [ ] Firestore Rules testadas com emulador (incluir testes de regras)
- [ ] Nenhum anexo sensível acessível sem autenticação e papel correto
