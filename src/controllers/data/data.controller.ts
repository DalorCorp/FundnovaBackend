import { Request, Response } from "express";
import DataServices from "../../services/data/data.service";

export default class DataController {
  private _dataServices;
  
  constructor() {
    this._dataServices = new DataServices();
  }
  
  async getPagamento(req: Request, res: Response): Promise<Response> {
    const { type, message, status } = await this._dataServices.getPagamento();

    if (!type) return res.status(status).json({ data: message, type });
    return res.status(status).json({ message, type });
  }
  
  async getFaturamento(req: Request, res: Response): Promise<Response> {
    const { type, message, status } = await this._dataServices.getFaturamento();

    if (!type) return res.status(status).json({ data: message, type });
    return res.status(status).json({ message, type });
  }
  
  async getRefugo(req: Request, res: Response): Promise<Response> {
    const { type, message, status } = await this._dataServices.getRefugo();

    if (!type) return res.status(status).json({ data: message, type });
    return res.status(status).json({ message, type });
  }
  
  async getFinanceiro(req: Request, res: Response): Promise<Response> {
    const { type, message, status } = await this._dataServices.getFinanceiro();

    if (!type) return res.status(status).json({ data: message, type });
    return res.status(status).json({ message, type });
  }
}