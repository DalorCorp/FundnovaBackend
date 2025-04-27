import { Router } from "express";
import PagamentoController from "../../controllers/pagamento/pagamento.controller";

const pagamentoRouter = Router();

const pagamentoControllers = new PagamentoController();

pagamentoRouter.get("/", pagamentoControllers.getPagamento.bind(pagamentoControllers));

export default pagamentoRouter;