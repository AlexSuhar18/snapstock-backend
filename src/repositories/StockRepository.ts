import { IStockRepository } from "../Interfaces/IStockRepository";
import { Stock } from "../models/stocksModel";
import BaseRepository from "./BaseRepository";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import LoggerService from "../services/LoggerService";

class StockRepository
  extends BaseRepository<Stock>
  implements IStockRepository
{
  constructor() {
    super("stocks");
  }

  async create(stockData: Stock): Promise<Stock> {
    return await super.create(stockData);
  }

  async update(id: string, stockData: Partial<Stock>): Promise<Stock> {
    if (
      stockData.quantity !== undefined &&
      (typeof stockData.quantity !== "number" || stockData.quantity < 0)
    ) {
      throw new Error("Stock quantity must be a positive number.");
    }
    return await super.update(id, stockData);
  }

  async getAll(): Promise<Stock[]> {
    return await super.getAll();
  }

  async getById(id: string): Promise<Stock> {
    return await super.getById(id);
  }

  async findByProductId(productId: string): Promise<Stock | null> {
    if (!productId || typeof productId !== "string") {
      throw new Error("Invalid productId.");
    }
    return await super.getByField("productId", productId);
  }

  async findByLocation(location: string): Promise<Stock | null> {
    if (!location || typeof location !== "string") {
      throw new Error("Invalid location.");
    }
    return await super.getByField("location", location);
  }

  async delete(id: string): Promise<Stock> {
    const stock = await this.getById(id);
    if (!stock) {
      throw new Error(`Stock with ID ${id} not found.`);
    }
    await super.delete(id);
    LoggerService.logInfo(`🗑️ Stock deleted: ${id}`);
    return stock;
  }

  async deleteStockByProductId(productId: string): Promise<Stock> {
    if (!productId || typeof productId !== "string") {
      throw new Error("Invalid productId.");
    }
    const stock = await this.findByProductId(productId);
    if (!stock) {
      throw new Error("Stock entry not found for this productId.");
    }
    if (!stock.id) {
      throw new Error("Stock ID is missing and cannot be deleted.");
    }
    await super.delete(stock.id);
    LoggerService.logInfo(`🗑️ Stock deleted for productId: ${productId}`);
    return stock;
  }

  async deleteMultiple(ids: string[]): Promise<Stock[]> {
    const deletedStocks: Stock[] = [];
    for (const id of ids) {
      const stock = await this.getById(id);
      if (stock) {
        await super.delete(id);
        deletedStocks.push(stock);
      }
    }
    LoggerService.logInfo(`🗑️ Deleted ${deletedStocks.length} stocks`);
    return deletedStocks;
  }

  async softDeleteStock(id: string): Promise<Stock> {
    const updatedStock = await this.update(id, {
      deletedAt: new Date().toISOString(),
      notified: false,
    });
    LoggerService.logInfo(`🗑️ Stock soft-deleted: ${id}`);
    return updatedStock;
  }

  async restoreStock(id: string): Promise<Stock> {
    const updatedStock = await this.update(id, {
      deletedAt: null,
      notified: false,
    });
    LoggerService.logInfo(`♻️ Stock restored: ${id}`);
    return updatedStock;
  }

  async getDeletedStocks(): Promise<Stock[]> {
    const allStocks = await this.getAll();
    return allStocks.filter((stock) => stock.deletedAt !== null);
  }

  async getStockReport(): Promise<{
    totalItems: number;
    lowStockItems: Stock[];
  }> {
    const stocks = await this.getAll();
    return {
      totalItems: stocks.length,
      lowStockItems: stocks.filter((stock) => stock.quantity < 10),
    };
  }
}

export default new StockRepository();
