import { Router } from "express";
import FaturamentoController from "../../controllers/faturamento/faturamento.controller";

const faturamentoRouter = Router();

const faturamentoControllers = new FaturamentoController();

faturamentoRouter.get("/", faturamentoControllers.getFaturamento.bind(faturamentoControllers));

export default faturamentoRouter;