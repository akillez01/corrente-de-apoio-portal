// Custom server para rodar o Next.js sob o Phusion Passenger (Plesk Node.js Toolkit).
// Passenger espera um arquivo de entrada Node que escute em process.env.PORT — não
// executa `npm start`/`next start` diretamente. Este wrapper usa exatamente o padrão
// "Custom Server" documentado pelo Next.js (mesmo runtime do `next start`, só que
// invocado programaticamente). Não altera comportamento da aplicação.
const { createServer } = require("http");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const port = process.env.PORT || 3000;
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`doar.iceflu.org ouvindo na porta ${port}`);
  });
});
