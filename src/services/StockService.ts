import StockRepository from "../repositories/StockRepository";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { BadRequestError } from "../errors/CustomErrors";
import { EventTypes } from "../events/EventTypes";
import { Stock } from "../models/stocksModel";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";

class StockService {
  /**
   * ✅ Creează un nou stoc
   */
  static async createStock(stockData: Partial<Stock>): Promise<Stock> {
    ModuleMiddleware.ensureModuleActive("stocks");

    if (!stockData.name || stockData.quantity === undefined) {
      throw new BadRequestError("Missing required fields: name, quantity.");
    }

    const stock = await StockRepository.create(new Stock(stockData));

    if (!stock.id) throw new Error("Stock ID is undefined after creation");

    // 🔹 Emit event și log
    await EventService.emitEvent(EventTypes.STOCK_CREATED, {
      stockId: stock.id, // ✅ Asigură că este un string valid
      name: stock.name,
    });
    await LoggerService.logInfo(`📦 Stock created: ${stock.name} (ID: ${stock.id})`);

    return stock;
  }

  /**
   * ✅ Actualizează cantitatea unui stoc
   */
  static async updateStock(
    stockId: string,
    quantity: number
  ): Promise<{ id: string; quantity: number }> {
    ModuleMiddleware.ensureModuleActive("stocks");
  
    if (quantity < 0) throw new BadRequestError("Quantity cannot be negative.");
  
    await StockRepository.update(stockId, { quantity }); // ✅ Nu mai încercăm să salvăm valoarea returnată
  
    const updatedStock = await StockRepository.getById(stockId); // ✅ Obține stocul actualizat
  
    if (!updatedStock) {
      throw new Error(`Stock with ID ${stockId} not found.`);
    }
  
    // 🔹 Emit event și log
    await EventService.emitEvent(EventTypes.STOCK_UPDATED, { stockId, quantity });
    await LoggerService.logInfo(`📦 Stock updated: ID ${stockId}, New quantity: ${quantity}`);
  
    return { id: stockId, quantity: updatedStock.quantity }; // ✅ Returnează cantitatea corect actualizată
  }  

  /**
   * ✅ Obține toate stocurile active
   */
  static async getAllStocks(): Promise<Stock[]> {
    ModuleMiddleware.ensureModuleActive("stocks");

    return await StockRepository.getAll();
  }

  /**
   * ✅ Șterge un stoc
   */
  static async deleteStock(stockId: string): Promise<void> {
    ModuleMiddleware.ensureModuleActive("stocks");

    await StockRepository.softDeleteStock(stockId);

    // 🔹 Emit event și log
    await EventService.emitEvent(EventTypes.STOCK_DELETED, { stockId });
    await LoggerService.logInfo(`🗑️ Stock deleted: ID ${stockId}`);
  }

  /**
   * ✅ Generează raport de stocuri
   */
  static async generateStockReport(): Promise<{
    totalItems: number;
    lowStockItems: Stock[];
    reportGeneratedAt: string;
  }> {
    ModuleMiddleware.ensureModuleActive("stocks");

    const report = await StockRepository.getStockReport();

    const enrichedReport = {
      ...report,
      reportGeneratedAt: new Date().toISOString(), // ✅ Adăugat câmpul necesar
    };

    // 🔹 Emit event și log
    await EventService.emitEvent(EventTypes.STOCK_REPORT_GENERATED, enrichedReport);
    await LoggerService.logInfo("📊 Stock report generated.");

    return enrichedReport;
  }
}

export default StockService;
