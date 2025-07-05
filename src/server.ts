import "dotenv/config";
import App from "./index";
import http from "http";

const PORT = process.env.APP_PORT || 30001; // HTTPS port
const HTTP_PORT = 80; // HTTP port

// Start HTTPS server
new App().start(PORT);

// Optional: Redirect HTTP → HTTPS
http.createServer((req, res) => {
  const host = req.headers.host?.replace(/:\d+$/, `:${PORT}`);
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
}).listen(HTTP_PORT, () => {
  console.log(`Redirecionando HTTP (porta ${HTTP_PORT}) para HTTPS (porta ${PORT})`);
});
