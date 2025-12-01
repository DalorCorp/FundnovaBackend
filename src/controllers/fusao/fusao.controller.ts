import { Request, Response } from "express";
import FusaoServices from "../../services/fusao/fusao.service";

export default class FusaoController {
  private _fusaoServices;
  
  constructor() {
    this._fusaoServices = new FusaoServices();
  }
  
  async getFusao(req: Request, res: Response): Promise<Response> {
    const { type, message, status } = await this._fusaoServices.getFusao();

    if (!type) return res.status(status).json({ data: message, type });
    return res.status(status).json({ message, type });
  }
}