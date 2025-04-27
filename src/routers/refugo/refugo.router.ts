import { Router } from "express";
import RefugoController from "../../controllers/refugo/refugo.controller";

const refugoRouter = Router();

const refugoControllers = new RefugoController();

refugoRouter.get("/", refugoControllers.getRefugo.bind(refugoControllers));

export default refugoRouter;