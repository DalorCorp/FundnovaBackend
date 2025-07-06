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
    this.app = express ();
    this.config();

    this.app.use("/pagamento", PagamentoRouter);
    this.app.use("/faturamento", FaturamentoRouter);
    this.app.use("/refugo", RefugoRouter);
  }

  private config():void {
    this.app.use(cors());
    
    // const accessControl: express.RequestHandler = (_req, res, next) => {
    //   res.header("Access-Control-Allow-Origin", "*");
    //   res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,PUT,PATCH");
    //   res.header("Access-Control-Allow-Headers", "*");
    //   next();
    // };
    // this.app.use(accessControl);

    this.app.use(express.json());
    
  }

  public start(PORT: string | number): void {
  const certsPath = path.resolve(__dirname, "../Certs");

  try {
    console.log("Lendo certificados em:", certsPath);

    const key = fs.readFileSync(path.join(certsPath, "fundnovacloud.origus.com.br-key.pem"));
    console.log("Chave privada carregada:", key.length, "bytes");

    const cert = fs.readFileSync(path.join(certsPath, "fundnovacloud.origus.com.br-crt.pem"));
    console.log("Certificado carregado:", cert.length, "bytes");

    const ca = fs.readFileSync(path.join(certsPath, "fundnovacloud.origus.com.br-chain.pem"));
    console.log("CA carregado:", ca.length, "bytes");

    const options = { key, cert, ca };

    https.createServer(options, this.app).listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Servidor HTTPS rodando na porta ${PORT}`);
    });

  } catch (err) {
    console.error("Erro ao carregar certificados:", err);
  }
}
}