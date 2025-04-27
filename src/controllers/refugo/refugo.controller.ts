import { Request, Response } from "express";
import RefugoService from "../../services/refugo/refugo.service";

export default class RefugoController {
  private _refugoServices;
  
  constructor() {
    this._refugoServices = new RefugoService();
  }
  
  async getRefugo(req: Request, res: Response): Promise<Response> {
    const { type, message, status } = await this._refugoServices.getRefugo();

    if (!type) return res.status(status).json({ data: message, type });
    return res.status(status).json({ message, type });
  }
}