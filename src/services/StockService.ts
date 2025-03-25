import EventService from "../services/EventService";
import LoggerService from "../services/LoggerService";
import StockRepository from "../repositories/StockRepository";
import { EventTypes } from "../events/EventTypes";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";
import { StockValidationService } from "../services/validation/StockValidationService";
import { NotFoundError, BadRequestError } from "../errors/CustomErrors";
import { Stock } from "../models/stocksModel";

class StockService {
  /**
   * ✅ Obține toate stocurile
   */
  static async getAllStocks() {
    ModuleMiddleware.ensureModuleActive("stocks");
    return await StockRepository.getAll();
  }

  /**
   * ✅ Obține un stoc după ID
   */
  static async getStockById(id: string) {
    try {
      ModuleMiddleware.ensureModuleActive("stocks");

      if (!id) {
        throw new BadRequestError("❌ Stock ID is required.");
      }

      const stock = await StockRepository.getById(id);
      if (!stock) {
        throw new NotFoundError(`❌ Stock with ID ${id} not found`);
      }
      return stock;
    } catch (error) {
      LoggerService.logError(`❌ Error fetching stock with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * ✅ Creează un nou stoc
   */
  static async createStock(data: any) {
    try {
        ModuleMiddleware.ensureModuleActive("stocks");

        if (!data) {
            throw new BadRequestError("❌ Missing stock data.");
        }

        // 🔍 Validăm datele înainte de creare
        StockValidationService.validateCreateStock(data);

        // 🔎 Verifică dacă un stoc cu același productId deja există
        const existingStock = await StockRepository.getByField("productId", data.productId);
        if (existingStock) {
            throw new BadRequestError(`❌ Stock already exists for product ID ${data.productId}`);
        }

        const newStock = new Stock(data);
        const createdStock = await StockRepository.create(newStock);

        // 🔥 Verifică dacă stocul este critic
        await this.checkCriticalStock(createdStock);

        // 🔥 Emitere eveniment
        try {
            await EventService.emitEvent(EventTypes.STOCK_CREATED, {
                stockId: createdStock.id || "unknown_id",
                name: createdStock.name || "Unnamed Stock",
            });
        } catch (eventError) {
            LoggerService.logError("⚠️ Error emitting STOCK_CREATED event", eventError);
        }

        LoggerService.logInfo(`📦 New stock created: ${createdStock.id}`);
        return { success: true, message: "✅ Stock created successfully", data: createdStock };
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

        if (!id) {
            throw new BadRequestError("❌ Stock ID is required.");
        }

        if (!data) {
            throw new BadRequestError("❌ No update data provided.");
        }

        // 🔍 Verifică dacă stocul există înainte de update
        const existingStock = await StockRepository.getById(id);
        if (!existingStock) {
            throw new NotFoundError(`❌ Stock with ID ${id} not found`);
        }

        // 🔍 Validăm datele înainte de update
        StockValidationService.validateStockUpdate(data);

        const updatedStockData = {
            ...existingStock,
            ...data,
            updatedAt: new Date().toISOString(), // ✅ Actualizare timestamp
        };

        const updatedStock = await StockRepository.update(id, updatedStockData);

        // 🔥 Verifică dacă stocul este critic
        await this.checkCriticalStock(updatedStock);

        // 🔥 Emitere eveniment
        try {
            await EventService.emitEvent(EventTypes.STOCK_UPDATED, {
                stockId: updatedStock.id ?? "unknown_id",
                quantity: updatedStock.quantity ?? 0,
            });
        } catch (eventError) {
            LoggerService.logError("⚠️ Error emitting STOCK_UPDATED event", eventError);
        }

        return { success: true, message: "✅ Stock updated successfully", data: updatedStock };
    } catch (error) {
        LoggerService.logError("❌ Error updating stock", error);
        throw error;
    }
}

/**
 * ✅ Verifică și emite alertă pentru stocurile critice
 */
static async checkCriticalStock(stock: Stock): Promise<void> {
  if (stock.isCriticalStock()) {
      LoggerService.logWarn(`⚠️ Critical stock alert for product ${stock.productId} at ${stock.location}`);

      // 🔥 Emitere eveniment de alertă pentru stoc critic
      try {
          await EventService.emitEvent(EventTypes.STOCK_CRITICAL, {
              stockId: stock.id ?? "unknown_id",
              productId: stock.productId,
              quantity: stock.quantity,
              location: stock.location,
          });
      } catch (eventError) {
          LoggerService.logError("⚠️ Error emitting STOCK_CRITICAL event", eventError);
      }
  }
}

  /**
   * ✅ Șterge un stoc
   */
  static async deleteStock(id: string) {
    try {
      ModuleMiddleware.ensureModuleActive("stocks");

      if (!id) {
        throw new BadRequestError("❌ Stock ID is required.");
      }

      // 🔍 Verifică dacă stocul există înainte de ștergere
      const stock = await StockRepository.getById(id);
      if (!stock) {
        throw new NotFoundError(`❌ Stock with ID ${id} not found`);
      }

      await StockRepository.delete(id);

      // 🔥 Emitere eveniment protejat
      try {
        await EventService.emitEvent(EventTypes.STOCK_DELETED, {
          stockId: id,
        });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting STOCK_DELETED event", eventError);
      }

      return { success: true, message: "✅ Stock deleted successfully", stockId: id };
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

      // 🔥 Emitere eveniment protejat
      try {
        await EventService.emitEvent(EventTypes.STOCK_REPORT_GENERATED, {
          reportGeneratedAt: new Date().toISOString(),
        });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting STOCK_REPORT_GENERATED event", eventError);
      }

      return { success: true, message: "✅ Stock report generated successfully", data: stockReport };
    } catch (error) {
      LoggerService.logError("❌ Error generating stock report", error);
      throw error;
    }
  }
}

export default StockService;
