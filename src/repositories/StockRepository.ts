import FirebaseConfig from "../config/firebase";
import { Stock } from "../models/stocksModel";
import { Firestore } from "firebase-admin/firestore";
import BaseRepository from "./BaseRepository";
import { IStockRepository } from "./Interfaces/IStockRepository";
import LoggerService from "../services/LoggerService";
import PluginManager from "../core/PluginManager";

const db = FirebaseConfig.getFirestore();
const STOCK_COLLECTION = "stocks";

class StockRepository
  extends BaseRepository<Stock>
  implements IStockRepository
{
  constructor() {
    super(STOCK_COLLECTION);
  }

  private checkModuleActive() {
    if (!PluginManager.isModuleActive("stocks")) {
      throw new Error("Stocks module is disabled");
    }
  }

  async create(stockData: Stock): Promise<Stock> {
    this.checkModuleActive();
    try {
      const stockRef = db.collection(STOCK_COLLECTION).doc();
      stockData.id = stockRef.id;
      await stockRef.set(stockData);
      LoggerService.logInfo(`📦 Stock created: ${stockData.id}`);
      return stockData;
    } catch (error) {
      LoggerService.logError("❌ Error creating stock", error);
      throw new Error("Error creating stock");
    }
  }

  async update(id: string, stockData: Partial<Stock>): Promise<void> {
    this.checkModuleActive();
    try {
      await db.collection(STOCK_COLLECTION).doc(id).update(stockData);
      LoggerService.logInfo(`📦 Stock updated: ${id}`);
    } catch (error) {
      LoggerService.logError("❌ Error updating stock", error);
      throw new Error("Error updating stock");
    }
  }

  async getAll(): Promise<Stock[]> {
    this.checkModuleActive();
    return await super.getAll();
  }

  async getById(id: string): Promise<Stock | null> {
    this.checkModuleActive();
    return await super.getById(id);
  }

  async delete(id: string): Promise<void> {
    this.checkModuleActive();
    return await super.delete(id);
  }

  async softDeleteStock(id: string): Promise<void> {
    this.checkModuleActive();
    try {
      await db
        .collection(STOCK_COLLECTION)
        .doc(id)
        .update({ deletedAt: new Date().toISOString(), notified: false });
      LoggerService.logInfo(`🗑️ Stock soft-deleted: ${id}`);
    } catch (error) {
      LoggerService.logError("❌ Error soft-deleting stock", error);
      throw new Error("Error soft-deleting stock");
    }
  }

  async restoreStock(id: string): Promise<void> {
    this.checkModuleActive();
    try {
      await db
        .collection(STOCK_COLLECTION)
        .doc(id)
        .update({ deletedAt: null, notified: false });
      LoggerService.logInfo(`♻️ Stock restored: ${id}`);
    } catch (error) {
      LoggerService.logError("❌ Error restoring stock", error);
      throw new Error("Error restoring stock");
    }
  }

  async getDeletedStocks(): Promise<Stock[]> {
    this.checkModuleActive();
    try {
      const snapshot = await db
        .collection(STOCK_COLLECTION)
        .where("deletedAt", "!=", null)
        .get();
      return snapshot.docs.map(
        (doc) => new Stock({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      LoggerService.logError("❌ Error fetching deleted stocks", error);
      throw new Error("Error fetching deleted stocks");
    }
  }

  async getStockReport(): Promise<{
    totalItems: number;
    lowStockItems: Stock[];
  }> {
    this.checkModuleActive();
    try {
      const stocks = await this.getAll();
      return {
        totalItems: stocks.length,
        lowStockItems: stocks.filter((stock) => stock.quantity < 10),
      };
    } catch (error) {
      LoggerService.logError("❌ Error generating stock report", error);
      throw new Error("Error generating stock report");
    }
  }
}

export default new StockRepository();
