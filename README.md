# Portal Daime Solidariedade

Aplicação Next.js 15 (App Router) + TypeScript + Tailwind + Firebase para conectar pessoas,
capacidades, necessidades, campanhas, projetos e oportunidades em uma rede de cuidado e
colaboração da ICEFLU. A arquitetura funcional da nova experiência está em
`docs/arquitetura-daime-solidariedade.md`.

## Conteúdo do repositório

| Caminho                           | O que é                                                            |
| --------------------------------- | ------------------------------------------------------------------- |
| `src/app`                       | Rotas da aplicação (App Router)                                   |
| `src/lib`                       | Domínio, tipos, integrações (Firebase, PSP)                      |
| `docs/guia-para-membros.md`    | Guia prático para operação do portal pela equipe                  |
| `docs/especificacao-tecnica.md` | Especificação: stack, RBAC, dados, regras, aceite                 |
| `docs/inventario-de-telas.md`   | Telas e componentes mapeados para rotas Next.js                     |
| `prototipo/`                    | Protótipo navegável original (HTML estático), referência visual |

## Desenvolvimento local

Requisitos: Node.js 20 ou superior e Firebase CLI.

Inicie os emuladores em um terminal:

```bash
firebase emulators:start --only auth,firestore --project corrente-de-apoio
```

Em outro terminal, instale as dependências e inicie o portal:

```bash
npm install
npm run dev
```

Para dados de exemplo, rode `FIRESTORE_EMULATOR_HOST=localhost:8085 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node scripts/seed-emulator.js` (senha das contas: `senha123`).

Abra [http://localhost:3000/pt](http://localhost:3000/pt). A página inicial e as campanhas
leem o Firestore Emulator na porta configurada em `.env.local`.

## Produção

O portal está publicado na Vercel em [www.daimesolidariedade.org](https://www.daimesolidariedade.org).
O domínio raiz [daimesolidariedade.org](https://daimesolidariedade.org) redireciona para `www`.
A reorganização do menu e das páginas foi publicada em 2026-10-22; um push na `main` publica
automaticamente em produção. Os avisos de novos cadastros por e-mail ainda dependem da
configuração do Resend; detalhes operacionais, histórico de correções e pendências estão em
`docs/deploy-vercel.md`, e o mapa de telas e coleções em `docs/inventario-de-telas.md`.

Para ver o protótipo visual original (referência de design):

```bash
npx serve prototipo
```

## Estado do projeto

Em evolução contínua, com produção publicada — ver `docs/especificacao-tecnica.md` (seção
"Entrega em fases") para o escopo da Fase 1 (MVP) e os critérios de aceite.
