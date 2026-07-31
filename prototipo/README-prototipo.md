# Corrente de Apoio — Portal de campanhas de apoio social (ICEFLU)

Protótipo navegável de alta fidelidade, em pt-BR, com dados fictícios.
Serve como referência visual e funcional para a implementação em Next.js + Firebase.

## Conteúdo do pacote

| Arquivo | O que é |
|---|---|
| `Corrente de Apoio.dc.html` | O protótipo completo (5 telas + modais). Abre no navegador. |
| `support.js` | Runtime necessário para o arquivo do protótipo rodar. |
| `README.md` | Este documento. |
| `docs/especificacao-tecnica.md` | Especificação para o desenvolvimento (stack, RBAC, dados, regras, aceite). |
| `docs/inventario-de-telas.md` | Cada tela e componente do protótipo mapeado para rotas Next.js. |

## Como abrir localmente

O protótipo carrega o runtime por `<script src>`, então precisa de um servidor estático
(abrir por `file://` pode ser bloqueado pelo navegador):

```bash
cd pasta-do-projeto
npx serve .          # ou: python3 -m http.server 8080
```

Depois abra `http://localhost:3000/Corrente%20de%20Apoio.dc.html`.

## O que o protótipo demonstra

- **Portal público** — hero institucional, 3 campanhas (urgente/saúde, moradia, concluída com prestação publicada), pilares Verificado / Direto / Transparente.
- **Página da campanha** — selo de verificação, história revisada pela curadoria e a *Linha de transparência* de 5 etapas (concluídas em verde, atual em âmbar).
- **Curadoria** — fila de triagem com chips de estado; ao abrir um pedido: anexos privados, texto bruto do requerente (nunca publicado) vs. texto público revisado, e as transições Aprovar / Alinhamento / Reprovar atualizando a fila.
- **Financeiro** — repasses com segregação de função explícita; **"Confirmar repasse" fica bloqueado até anexar o comprovante**; ao confirmar, a linha vira "Repassado ✔" e a prestação de contas é publicada.
- **Como funciona** — 6 etapas do fluxo e 4 cards de salvaguardas institucionais.
- **Simulação de webhook** — no modal Pix/PayPal, "simular doação" incrementa arrecadado, contador de doações, barra de progresso e a linha de transparência ao vivo, com toast de confirmação — representa o Cloud Function que recebe o webhook do PSP.

## Direção visual (tokens)

```
verde floresta  #1B3A2D    fundo         #F2F5F0
verde folha     #2F6B4F    cards         #FFFFFF
verde claro     #5FA37E    tinta         #1E2A22
âmbar (acento)  #D9A441    tinta suave   #5A6B60
terracota       #B0522D    linha         #DDE6DE
```

Tipografia: **Fraunces** (títulos), **Inter** (corpo), **JetBrains Mono** (números e metadados).
Raio dos cards 14px, botões 10px, sombras suaves (`0 14px 30px rgba(27,58,45,.14)` no hover).

## Estado do protótipo

Tudo é estático/simulado: não há autenticação, banco, nem chamadas de rede.
Idioma PT/EN/ES no header é apenas visual (as strings ainda não estão externalizadas).
A próxima etapa é a Fase 1 descrita em `docs/especificacao-tecnica.md`.
