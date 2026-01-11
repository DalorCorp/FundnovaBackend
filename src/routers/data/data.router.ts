import { Router } from "express";
import DataController from "../../controllers/data/data.controller";

const dataRouter = Router();

const dataControllers = new DataController();

dataRouter.get("/pagamento", dataControllers.getPagamento.bind(dataControllers));
dataRouter.get("/faturamento", dataControllers.getFaturamento.bind(dataControllers));
dataRouter.get("/refugo", dataControllers.getRefugo.bind(dataControllers));
dataRouter.get("/financeiro", dataControllers.getFinanceiro.bind(dataControllers));

export default dataRouter;