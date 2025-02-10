import { StockRepository } from "../repositories/StockRepository";
import { Stock } from "../models/stocks";
import LoggerService from "./LoggerService";
import EventBus from "../events/EventBus";
import { BadRequestError } from "../errors/BadRequestError";
import { EventTypes } from "../events/EventTypes";

export class StockService {
    /**
     * ✅ Creează un nou produs în stoc
     */
    static async createStock(stockData: Partial<Stock>): Promise<Stock> {
        try {
            if (!stockData.name || stockData.quantity === undefined) {
                throw new BadRequestError("Missing required fields: name, quantity.");
            }

            const stock = await StockRepository.createStock(new Stock(stockData));

            // 🔹 Emitere eveniment
            EventBus.emitEvent(EventTypes.STOCK_CREATED, { stockId: stock.id, name: stock.name });

            LoggerService.logInfo(`📦 Stock created: ${stock.name} (ID: ${stock.id})`);
            return stock;
        } catch (error) {
            LoggerService.logError("❌ Error creating stock", error);
            throw error;
        }
    }

    /**
     * ✅ Actualizează cantitatea unui produs
     */
    static async updateStock(stockId: string, quantity: number): Promise<{ id: string; quantity: number }> {
        try {
            if (quantity < 0) throw new BadRequestError("Quantity cannot be negative.");

            const updatedStock = await StockRepository.updateStock(stockId, quantity);

            // 🔹 Emitere eveniment
            EventBus.emitEvent(EventTypes.STOCK_UPDATED, { stockId, quantity });

            LoggerService.logInfo(`📦 Stock updated: ID ${stockId}, New quantity: ${quantity}`);
            return updatedStock;
        } catch (error) {
            LoggerService.logError("❌ Error updating stock", error);
            throw error;
        }
    }

    /**
     * ✅ Obține toate produsele din stoc
     */
    static async getAllStocks(): Promise<Stock[]> {
        try {
            const stocks = await StockRepository.getAllStocks();
            return stocks;
        } catch (error) {
            LoggerService.logError("❌ Error fetching all stocks", error);
            throw error;
        }
    }

    /**
     * ✅ Șterge un produs din stoc
     */
    static async deleteStock(stockId: string): Promise<void> {
        try {
            await StockRepository.deleteStock(stockId);

            // 🔹 Emitere eveniment
            EventBus.emitEvent(EventTypes.STOCK_DELETED, { stockId});

            LoggerService.logInfo(`🗑️ Stock deleted: ID ${stockId}`);
        } catch (error) {
            LoggerService.logError("❌ Error deleting stock", error);
            throw error;
        }
    }

    /**
     * ✅ Generează raport de stocuri
     */
    static async generateStockReport(): Promise<{ totalItems: number; lowStockItems: Stock[] }> {
        try {
            const report = await StockRepository.getStockReport();
            LoggerService.logInfo("📊 Stock report generated.");
            return report;
        } catch (error) {
            LoggerService.logError("❌ Error generating stock report", error);
            throw error;
        }
    }
}