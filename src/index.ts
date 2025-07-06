import express from "express";
import cors from "cors";
import PagamentoRouter from "./routers/pagamento/pagamento.router";
import FaturamentoRouter from "./routers/faturamento/faturamento.router";
import RefugoRouter from "./routers/refugo/refugo.router";
import fs from "fs";
import https from "https";
import path from "path";

export default class App {
  public app: express.Express;

  constructor () {
    this.app = express();
    this.config();
    this.routes();
  }

  private config(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use("/pagamento", PagamentoRouter);
    this.app.use("/faturamento", FaturamentoRouter);
    this.app.use("/refugo", RefugoRouter);
  }

  public start(PORT: string | number): void {
    const certsPath = path.resolve(__dirname, "../Certs");
    const options = {
      key: fs.readFileSync(path.join(certsPath, "fundnovacloud.origus.com.br-key.pem")),
      cert: fs.readFileSync(path.join(certsPath, "fundnovacloud.origus.com.br-crt.pem")),
      ca: fs.readFileSync(path.join(certsPath, "fullchain.pem")), // R3 + ISRG Root X1
    };

    console.log(`🟢 Lendo certificados em: ${certsPath}`);
    console.log(`🔐 Iniciando servidor HTTPS na porta ${PORT}`);

    https.createServer(options, this.app).listen(Number(PORT), '0.0.0.0', () => {
      console.log(`✅ Servidor HTTPS rodando na porta ${PORT}`);
    });
  }
}
