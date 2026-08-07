# Corrente de Apoio — Portal de campanhas de apoio social (ICEFLU)

Aplicação Next.js 14 (App Router) + TypeScript + Tailwind + Firebase, implementando
o portal descrito em `docs/especificacao-tecnica.md`.

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

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Para ver o protótipo visual original (referência de design):

```bash
npx serve prototipo
```

## Estado do projeto

Em desenvolvimento — ver `docs/especificacao-tecnica.md` (seção "Entrega em fases") para
o escopo da Fase 1 (MVP) e os critérios de aceite.
