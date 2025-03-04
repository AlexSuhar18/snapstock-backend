import { Stock } from "../models/stocksModel";

export interface IStockRepository {
  getById(id: string): Promise<Stock | null>;
  getAll(): Promise<Stock[]>;
  create(stock: Stock): Promise<Stock>;
  update(id: string, stock: Partial<Stock>): Promise<Stock>; // 🔹 Schimbăm `void` cu `Stock`
  delete(id: string): Promise<Stock>;
  deleteMultiple(ids: string[]): Promise<Stock[]>;
}

