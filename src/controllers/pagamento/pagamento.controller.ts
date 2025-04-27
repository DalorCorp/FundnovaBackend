import { Request, Response } from "express";
import PagamentoService from "../../services/pagamento/pagamento.service";

export default class PagamentoController {
  private _pagamentoServices;
  
  constructor() {
    this._pagamentoServices = new PagamentoService();
  }
  
  async getPagamento(req: Request, res: Response): Promise<Response> {
    const { type, message, status } = await this._pagamentoServices.getPagamento();

    if (!type) return res.status(status).json({ data: message, type });
    return res.status(status).json({ message, type });
  }
}