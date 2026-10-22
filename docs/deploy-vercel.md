# Deploy na Vercel + anexos no Cloudflare R2

Registro da migração de hospedagem feita em 2026-09-21. Nenhum segredo está neste arquivo.

## Contexto e decisões

| Tema | Situação anterior | Decisão |
|---|---|---|
| Hospedagem | Plesk (`74.208.44.241`), Passenger + `server.js`, DNS no Cloudflare | **Vercel** (conta `akillez01`, projeto `corrente-de-apoio-portal`). Plesk deixa de ser usado. |
| Banco / Auth | Firebase (Firestore + Auth) | **Mantido.** Firestore é usado em 22 arquivos e o Auth (papéis por custom claims, Google) em 4; já há dados e usuários reais. Migrar para Neon seria uma reescrita. |
| Anexos | Disco local (`STORAGE_DIR`) | **Cloudflare R2** (bucket privado `apoio-social`), pois o disco da Vercel é efêmero/somente leitura. |
| Domínio | `daimesolidariedade.org` (zona Cloudflare) | Raiz e `www` configurados na Vercel e respondendo por HTTPS; a raiz redireciona para `www`. A autorização dos domínios no Firebase Authentication ainda precisa ser confirmada. |

## Alterações no código

- `src/lib/storage/localStorage.ts`: mesma API (`saveFile`/`readFile`), agora com dois backends.
  - Se `R2_BUCKET` está definido: usa R2 via `@aws-sdk/client-s3` (endpoint `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`).
  - Caso contrário: disco em `STORAGE_DIR` (dev local, sem mudança de comportamento).
  - A guarda contra path traversal vale nos dois modos (`safeKey` para o R2).
- Dependência nova: `@aws-sdk/client-s3`.
- `.env.example`: adicionadas `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
- Verificação: `tsc --noEmit` e `npm run lint` sem erros. `npm run build` foi executado pela própria Vercel com sucesso.
- `server.js` e `scripts/prepare-production.js` não são usados na Vercel (o primeiro era só para o Passenger).

## Vercel

- Projeto vinculado com `vercel link` (gera `.vercel/` e acrescenta `VERCEL_OIDC_TOKEN` ao `.env.local`, ambos ignorados pelo git).
- URLs: `https://corrente-de-apoio-portal.vercel.app` e `https://corrente-de-apoio-portal-achilles-projects-1c25cc7a.vercel.app`.
- Domínios personalizados ativos: `daimesolidariedade.org` e `www.daimesolidariedade.org`.
  O endereço principal é `https://www.daimesolidariedade.org`; a raiz redireciona para `www`.
  Não altere os registros Cloudflare sem necessidade: ambos os domínios estão validados pela
  Vercel e servindo por HTTPS.
- A validação do site não confirma a configuração do Firebase Authentication. Verifique no
  Firebase Console → Authentication → Settings → Authorized domains se os hosts
  `daimesolidariedade.org` e `www.daimesolidariedade.org` estão autorizados; inclua-os se
  estiverem ausentes.
- O primeiro deploy (`vercel deploy`) foi atribuído a **Production** automaticamente. Próximos deploys serão preview, exceto com `--prod`.
- Variáveis encontradas no ambiente **Production** da Vercel (nomes conferidos sem exibir valores):
  - `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_MESSAGING_SENDER_ID`, `_APP_ID` (tipo Config; a API key do app Web é pública por natureza e a proteção está nas regras do Firestore e nos domínios autorizados).
  - `FIREBASE_SERVICE_ACCOUNT_KEY` (Secret).
  - `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`.
  - `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
  - `NEXT_PUBLIC_APP_URL` e variáveis de e-mail não constam atualmente no ambiente Production;
    ver **Avisos de novos cadastros**.
  - `STORAGE_DIR` e as variáveis de emulador são locais e não foram cadastradas.
- Smoke test: `/pt` → 200, `/login` → 200, `GET /api/auth/session` → 405 (rota só aceita POST).

## Firebase

- Firebase Console → Authentication → Configurações → **Domínios autorizados**: adicionar
  `corrente-de-apoio-portal.vercel.app` e `corrente-de-apoio-portal-achilles-projects-1c25cc7a.vercel.app`.
  Confirmar também `daimesolidariedade.org` e `www.daimesolidariedade.org`; sem autorização
  dos hosts o login com Google pode falhar. O aviso de "upgrade para Identity Platform" na
  tela de "Vinculação de conta" não é necessário.

## Cloudflare R2

- Bucket `apoio-social` (Automatic, Standard, privado por padrão).
- Token S3 criado no Cloudflare com permissão **Object Read & Write**, restrito ao bucket
  `apoio-social`.
- As quatro variáveis foram cadastradas na Vercel em **Production**:
  `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY`.
- `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY` foram cadastradas como **Secret**. Os valores
  nunca são registrados neste documento.
- `src/lib/storage/localStorage.ts` seleciona R2 quando `R2_BUCKET` está configurado e usa
  `STORAGE_DIR` apenas como fallback local.
- O deploy de produção foi atualizado em 2026-09-21:
  `https://corrente-de-apoio-portal-7ktsdwx1c-achilles-projects-1c25cc7a.vercel.app`
  (alias principal: `https://corrente-de-apoio-portal.vercel.app`).

## Logins

- Papéis: `requerente`, `curador`, `financeiro`, `editor_conteudo`, `admin`.
- Produção: `achilles.oliveira.souza@gmail.com` (admin, via Google) e `admin@corrente.dev` (admin, e-mail/senha; senha gerada em 2026-08-01, não registrada aqui).
- Login Google de conta nova vira `requerente` automaticamente; os demais papéis só são atribuídos por um admin em `/admin/usuarios`.
- Contas `*@corrente.dev` com senha `senha123` existem só no emulador (`scripts/seed-emulator.js`). Remover/rotacionar o `admin@corrente.dev` de produção quando houver outro admin.
- Criar/redefinir admin: `node scripts/create-admin-user.js --target=production --email=... --password=... --nome=...`.

## Troca de senha (publicada em produção em 2026-09-21)

- `/conta` ("Minha conta", link no cabeçalho): troca de senha com reautenticação (senha atual + nova + confirmação, mín. 8 caracteres). Contas só-Google recebem um link por e-mail para definir senha.
- Tela de login: "Esqueci minha senha" (e-mail de redefinição do Firebase, resposta genérica para não revelar se o e-mail existe).
- Arquivos: `src/components/auth/ChangePasswordForm.tsx`, `src/app/(app)/conta/page.tsx`, `LoginForm.tsx`, `AppHeader.tsx`.
- Sugestão: traduzir o modelo do e-mail em Firebase → Authentication → Modelos.

## Redefinição de senha pelo admin (publicada em 2026-09-21)

- `/admin/usuarios`: botão "Redefinir senha" por usuário (não aparece na própria linha). Chama `POST /api/admin/usuarios/[uid]/senha` (só admin): gera senha temporária, revoga sessões do usuário, registra `senha_redefinida` na auditoria e mostra a senha uma única vez.
- Arquivos: `src/app/api/admin/usuarios/[uid]/senha/route.ts`, `src/components/admin/ResetPasswordButton.tsx`, `admin/usuarios/page.tsx`.

## Avisos de novos cadastros

- O código está preparado para enviar avisos de novas contas, pedidos de apoio, inscrições
  de voluntariado e contas criadas pela administração para `daimesolidariedade@gmail.com`
  (ou para o valor configurado em `SYSTEM_NOTIFICATION_EMAIL`), quando o Resend estiver
  configurado.
- Os avisos contêm apenas o tipo e a referência do cadastro e um link para o portal; não
  incluem dados pessoais, relatos nem anexos. O destinatário precisa entrar com uma conta
  institucional autorizada para consultar informações.
- **Estado em 2026-10-12:** o envio ainda não está habilitado em produção. A listagem das
  variáveis Production da Vercel não contém `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
  `SYSTEM_NOTIFICATION_EMAIL` nem `NEXT_PUBLIC_APP_URL`. Cadastre as credenciais e o
  remetente verificado no Resend, defina o destinatário `daimesolidariedade@gmail.com` e
  configure `NEXT_PUBLIC_APP_URL=https://www.daimesolidariedade.org`; depois publique novo
  deploy de produção.
- Sem essas variáveis ou se o provedor rejeitar o envio, o cadastro é salvo normalmente e
  a falha fica registrada nos logs do servidor (`notificationSent: false` na resposta da API).
- Configurar um destinatário de e-mail não cria conta nem concede permissões no portal. A
  revisão de inscrições de voluntariado ainda precisa de uma tela interna com acesso
  institucional apropriado.

## Pendências / riscos

1. **Teste funcional autenticado do upload:** o deploy e as rotas públicas foram validados, mas
   ainda é necessário entrar com um usuário requerente e enviar um anexo pequeno pela tela
   **Meus pedidos → Novo pedido**.
2. **Avisos por e-mail:** configurar as quatro variáveis listadas acima no ambiente Production
   da Vercel e fazer novo deploy. Até lá, os cadastros são persistidos, mas não há envio de e-mail.
3. **Firebase Authentication:** confirmar que os domínios raiz e `www` estão na lista de
   Authorized domains; a disponibilidade HTTPS do site já foi validada.
4. Mercado Pago (Pix) real continua não implementado; a rota de simulação segue bloqueada em produção.
5. Sem backup automático dos dados: o Firestore não tem rotina de export configurada.

## Registro de validação — 2026-09-21

- `npx tsc --noEmit`: aprovado.
- `npm run lint`: aprovado.
- `npx vercel deploy --prod --yes`: concluído com status **Ready**.
- Build remoto da Vercel: compilação, verificação de tipos, lint e geração das páginas aprovados.
- Smoke tests em produção:
  - `GET /pt` → `200`.
  - `GET /login` → `200`.
  - `GET /api/pedidos` → `405` (esperado, pois a rota aceita criação via `POST`).
- O limite comum foi centralizado em `src/lib/storage/limits.ts`:
  `MAX_UPLOAD_BYTES = 4 * 1024 * 1024`.
- O limite é aplicado no navegador e no servidor para pedidos, comprovantes e documentos
  de voluntários. A Vercel rejeita requisições acima de aproximadamente 4,5 MB antes da
  execução da rota; por isso o limite de arquivos foi fixado em 4 MB.

## Registro de produção — 2026-10-12

- Deploy Production anterior: `https://corrente-de-apoio-portal-4kprq34ka-achilles-projects-1c25cc7a.vercel.app`.
- Deploy Production atual: `https://corrente-de-apoio-portal-kehaz3jd9-achilles-projects-1c25cc7a.vercel.app`
  — estado **Ready**, publicado em 2026-10-12 às 16:31 (-04:00). Alias principal:
  `https://www.daimesolidariedade.org`.
- `GET https://www.daimesolidariedade.org/pt` → `200`.
- `GET https://www.daimesolidariedade.org/en` e `/login` → `200`.
- As rotas `/admin/conteudo` e `/admin/campanhas` redirecionam para `/login` sem sessão.
- `PUT /api/admin/conteudo` e `POST /api/site-media` sem autenticação → `403`.
- A imagem padrão da página inicial está referenciada no HTML e seu arquivo público retorna `200`.
- `GET https://daimesolidariedade.org/pt` → `308` para
  `https://www.daimesolidariedade.org/pt`.
- O build de produção está ativo; os avisos por e-mail permanecem pendentes da configuração
  do Resend e das variáveis de produção.
- O deploy não cria contas nem define senhas no Firebase Authentication. Para testar login
  de produção, a conta precisa existir no Firebase Auth e ter uma credencial válida; o usuário
  local `admin@corrente.dev` / `senha123` só existe no emulador e não funciona em produção.

## Deploy futuro

```bash
npx vercel deploy          # preview
npx vercel deploy --prod   # produção
npx vercel env ls          # conferir variáveis
```

## Painel editorial e publicação de campanhas

- `/admin/conteudo` permite a `editor_conteudo` e `admin` editar textos e imagens públicas em
  português e inglês. Formulários, consentimentos e dados operacionais permanecem fora do CMS.
- `/admin/usuarios` (somente `admin`) atribui a role `editor_conteudo`; contas novas não
  recebem acesso privilegiado por e-mail ou autocadastro. Em 2026-10-12, após solicitação
  explícita, `daimesolidariedade@gmail.com` recebeu `admin` no Firebase Auth e no perfil
  Firestore de produção; o papel foi verificado. Nenhuma senha foi redefinida nessa operação.
- `/admin/campanhas` lista apenas campanhas aprovadas pela curadoria. Publicar requer outro
  UID que não seja o aprovador; campanha e evento de auditoria são gravados em uma transação.
  O status `aprovado` não é público, e somente estados públicos aparecem nas listagens.
- Upload de mídia pública aceita JPEG, PNG, WebP ou AVIF até 4 MB, reprocessa e remove
  metadados antes de salvar em `site-media/`; anexos de solicitações seguem armazenamento
  privado separado.
- As alterações do painel ainda não foram implantadas em produção. Teste autenticado com
  contas autorizadas é pendente; o build local e as verificações de tipos/ESLint passaram.
