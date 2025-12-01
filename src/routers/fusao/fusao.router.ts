import { Router } from "express";
import FusaoController from "../../controllers/fusao/fusao.controller";

const FusaoRouter = Router();

const fusaoControllers = new FusaoController();

FusaoRouter.get("/", fusaoControllers.getFusao.bind(fusaoControllers));

export default FusaoRouter;