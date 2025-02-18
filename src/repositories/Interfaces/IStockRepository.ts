import { Stock } from "../../models/stocksModel";

export interface IStockRepository {
  getById(id: string): Promise<Stock | null>;
  getAll(): Promise<Stock[]>;
  create(stock: Stock): Promise<Stock>;
  update(id: string, stock: Partial<Stock>): Promise<void>;
  delete(id: string): Promise<void>;
}
