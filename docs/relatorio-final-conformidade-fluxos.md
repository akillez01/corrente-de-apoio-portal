# Relatorio final de conformidade por fluxo (E2E)

- Data: 2026-08-07T17:13:59.185Z
- Base URL: http://localhost:3000
- Resultado geral: 19/19 testes aprovados
- Falhas: 0

## Evidencias

- PASS | Sessao autenticada: requerente | requerente@corrente.dev
- PASS | Sessao autenticada: curador | curadoria@corrente.dev
- PASS | Sessao autenticada: financeiro | financeiro@corrente.dev
- PASS | Sessao autenticada: admin | admin@corrente.dev
- PASS | Pagina /meus-pedidos como requerente | status=200
- PASS | Pagina /curadoria como requerente | status=307 location=/login?erro=acesso-negado
- PASS | Pagina /curadoria como curador | status=200
- PASS | Pagina /financeiro como curador | status=307 location=/login?erro=acesso-negado
- PASS | Pagina /financeiro como financeiro | status=200
- PASS | Pagina /curadoria como financeiro | status=307 location=/login?erro=acesso-negado
- PASS | Pagina /admin/usuarios como admin | status=200
- PASS | Pagina /admin/atendimentos como admin | status=200
- PASS | API /api/pedidos como requerente | status=200 id=Wvum26r6KyZRNvBljjOW
- PASS | API /api/curadoria/:id bloqueia requerente | status=403
- PASS | API /api/curadoria/:id como curador | status=200
- PASS | API /api/financeiro/:campaignId como financeiro | status=200 campaignId=cadeira-seu-elias
- PASS | API /api/admin/usuarios como admin | status=200 uid=8g8VsLam9XLcs96R8CDh3tkrk6H2
- PASS | API /api/admin/usuarios bloqueia curador | status=403
- PASS | API /api/assistente publica | status=200

## Conclusao
- Todos os fluxos criticos testados passaram no E2E autenticado por papel.
