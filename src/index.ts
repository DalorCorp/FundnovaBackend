import express from "express";
import cors from "cors";
import PagamentoRouter from "./routers/pagamento/pagamento.router";
import FaturamentoRouter from "./routers/faturamento/faturamento.router";
import RefugoRouter from "./routers/refugo/refugo.router";

export default class App {
  public app: express.Express;

  constructor () {
    this.app = express();
    this.config();

    this.app.use("/pagamento", PagamentoRouter);
    this.app.use("/faturamento", FaturamentoRouter);
    this.app.use("/refugo", RefugoRouter);
  }

  private config(): void {
    this.app.use(cors());

    this.app.use(express.json());
  }

  public start(PORT: string | number): void {
    this.app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Servidor HTTP rodando na porta ${PORT}`);
    });
  }
}
