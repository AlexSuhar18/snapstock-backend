import EventService from "../services/EventService";
import LoggerService from "../services/LoggerService";
import StockRepository from "../repositories/StockRepository";
import { EventTypes } from "../events/EventTypes";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";
import { StockValidationService } from "../services/validation/StockValidationService";

class StockService {
  /**
   * ✅ Obține toate stocurile
   */
  static async getAllStocks() {
    ModuleMiddleware.ensureModuleActive("stocks");
    return await StockRepository.getAll();
  }

  /**
   * ✅ Creează un nou stoc
   */
  static async createStock(data: any) {
    try {
      ModuleMiddleware.ensureModuleActive("stocks");

      // 🔍 Validăm datele înainte de creare
      StockValidationService.validateCreateStock(data);

      const newStock = await StockRepository.create(data);

      // 🔥 Emitere eveniment
      await EventService.emitEvent(EventTypes.STOCK_CREATED, {
        stockId: newStock.id || "unknown_id",
        name: newStock.name || "Unnamed Stock",
      });

      LoggerService.logInfo(`📦 New stock created: ${newStock.id}`);
      return newStock;
    } catch (error) {
      LoggerService.logError("❌ Error creating stock", error);
      throw error;
    }
  }

  /**
   * ✅ Actualizează un stoc existent
   */
  static async updateStock(id: string, data: any) {
    try {
      ModuleMiddleware.ensureModuleActive("stocks");

      // 🔍 Validăm datele înainte de update
      StockValidationService.validateStockUpdate(data);

      const updatedStock = await StockRepository.update(id, data);

      await EventService.emitEvent(EventTypes.STOCK_UPDATED, {
        stockId: updatedStock.id ?? "unknown_id",
        quantity: updatedStock.quantity ?? 0,
      });

      return updatedStock;
    } catch (error) {
      LoggerService.logError("❌ Error updating stock", error);
      throw error;
    }
  }

  /**
   * ✅ Șterge un stoc
   */
  static async deleteStock(id: string) {
    try {
      ModuleMiddleware.ensureModuleActive("stocks");

      await StockRepository.delete(id);

      await EventService.emitEvent(EventTypes.STOCK_DELETED, {
        stockId: id,
      });

      return { success: true, stockId: id };
    } catch (error) {
      LoggerService.logError("❌ Error deleting stock", error);
      throw error;
    }
  }

  /**
   * ✅ Generează un raport despre stocuri
   */
  static async generateStockReport() {
    try {
      ModuleMiddleware.ensureModuleActive("stocks");

      const stockReport = await StockRepository.getStockReport();

      await EventService.emitEvent(EventTypes.STOCK_REPORT_GENERATED, {
        reportGeneratedAt: new Date().toISOString(),
      });

      return stockReport;
    } catch (error) {
      LoggerService.logError("❌ Error generating stock report", error);
      throw error;
    }
  }
}

export default StockService;
