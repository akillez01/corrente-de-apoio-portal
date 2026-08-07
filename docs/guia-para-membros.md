# Guia para membros — Corrente de Apoio Portal

Este guia explica, de forma prática, como o portal funciona no dia a dia da equipe.

## 1. O que é o portal

O Corrente de Apoio Portal organiza campanhas de ajuda social com três pilares:

- verificação humana (curadoria antes de publicar)
- doação direta para a conta institucional
- prestação de contas pública no fechamento da campanha

Importante: o portal não guarda dados de cartão e não custodia dinheiro de doadores.

## 2. Quem usa e o que cada papel faz

- requerente: envia pedido de apoio, acompanha status e mensagens da equipe
- curador: analisa pedidos, conversa com o requerente, revisa texto público e aprova/reprova
- financeiro: confirma repasse ao beneficiário e anexa comprovante
- admin: cria usuários e ajusta papéis

Regra de segurança: quem aprova campanha na curadoria não pode confirmar o repasse no financeiro.

## 3. Fluxo completo de uma campanha

1. Requerente envia pedido com descrição, meta e anexos privados.
2. Curadoria recebe na fila e inicia análise.
3. Se necessário, curadoria envia para alinhamento com mensagem ao requerente.
4. Curadoria aprova e publica a campanha com texto revisado.
5. Doações entram por Pix/PayPal e o progresso é atualizado.
6. Ao fim (meta atingida ou prazo), financeiro confirma o repasse com comprovante.
7. A campanha exibe prestação de contas pública.

## 4. O que é público e o que é privado

Público:

- lista de campanhas publicadas
- página da campanha
- progresso de arrecadação
- prestação de contas (quando publicada)

Privado (somente áreas autenticadas e com papel correto):

- texto bruto enviado pelo requerente
- anexos sensíveis (laudos, documentos)
- fila e ações de curadoria
- confirmação de repasse no financeiro
- gestão de usuários e papéis

## 5. Navegação por área

- portal público: /pt
- login: /login
- requerente: /meus-pedidos e /meus-pedidos/novo
- curadoria: /curadoria e /curadoria/{id}
- financeiro: /financeiro
- admin: /admin/usuarios

## 6. Como acessar no ambiente local

Pré-requisito:

- Node.js instalado

Passos:

1. Instalar dependências: npm install
2. Iniciar app: npm run dev
3. Abrir no navegador: http://localhost:3000

## 7. Contas de teste (ambiente local)

Quando o projeto está com emuladores ativos, a tela de login pode preencher usuários de demonstração.

- curadoria@corrente.dev
- financeiro@corrente.dev
- admin@corrente.dev
- requerente@corrente.dev
- senha padrão: senha123

Sincronizar usuários de teste (se necessário):

FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 FIRESTORE_EMULATOR_HOST=localhost:8080 npm run sync:users

## 8. Regras operacionais para a equipe

- não publicar pedido sem revisão humana da curadoria
- não confirmar repasse sem comprovante anexado
- não compartilhar anexos sensíveis fora dos fluxos autorizados
- usar a área admin para qualquer mudança de papel de usuário

## 9. Dúvidas comuns

O texto que o requerente escreveu vai para o público automaticamente?

- Não. O texto público é revisado pela curadoria antes de publicação.

O doador precisa se identificar?

- Não. Doação anônima é o padrão.

Quem pode mudar papel de usuário?

- Apenas admin.

## 10. Referências técnicas

- README geral do projeto: ../README.md
- especificação técnica: ./especificacao-tecnica.md
- inventário de telas: ./inventario-de-telas.md
- nota de arquitetura e conformidade: ./nota-arquitetura-e-conformidade.md
