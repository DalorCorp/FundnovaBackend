import { Request, Response } from "express";
import FaturamentoService from "../../services/faturamento/faturamento.service";

export default class faturamentoController {
  private _faturamentoServices;
  
  constructor() {
    this._faturamentoServices = new FaturamentoService();
  }
  
  async getFaturamento(req: Request, res: Response): Promise<Response> {
    const { type, message, status } = await this._faturamentoServices.getFaturamento();

    if (!type) return res.status(status).json({ data: message, type });
    return res.status(status).json({ message, type });
  }
}