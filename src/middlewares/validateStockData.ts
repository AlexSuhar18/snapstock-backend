import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import { StockValidationService } from "../services/validation/StockValidationService";
import LoggerService from "../services/LoggerService";
import ProductRepository from "../repositories/ProductRepository"; 

class ValidateStockMiddleware {
  /**
   * ✅ Validare pentru creare stoc
   */
  static async validateStockCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, quantity, location } = req.body;

      // 🔍 Validare prealabilă
      if (!productId || typeof productId !== "string") {
        LoggerService.logWarn("❌ Invalid or missing productId in stock create", { productId });
        throw new BadRequestError("Invalid or missing productId.");
      }

      if (typeof quantity !== "number" || quantity < 0) {
        LoggerService.logWarn("❌ Invalid quantity in stock create", { quantity });
        throw new BadRequestError("Quantity must be a non-negative number.");
      }

      if (location && typeof location !== "string") {
        LoggerService.logWarn("❌ Invalid location in stock create", { location });
        throw new BadRequestError("Location must be a string.");
      }

      // ✅ Verificăm existența produsului (dacă ai un repository de produse)
      const product = await ProductRepository.getById(productId);
      if (!product) {
        LoggerService.logWarn("❌ Product does not exist for stock create", { productId });
        throw new BadRequestError(`Product with ID '${productId}' does not exist.`);
      }

      // 🔎 Validări custom (ex. structura internă)
      StockValidationService.validateCreateStock(req.body);
      next();
    } catch (error) {
      LoggerService.logError("❌ Stock create validation failed", error);
      next(error);
    }
  }

  /**
   * ✅ Validare pentru actualizare stoc
   */
  static validateStockUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { quantity, location } = req.body;

      if (quantity !== undefined && (typeof quantity !== "number" || quantity < 0)) {
        LoggerService.logWarn("❌ Invalid quantity in stock update", { quantity });
        throw new BadRequestError("Quantity must be a non-negative number.");
      }

      if (location !== undefined && typeof location !== "string") {
        LoggerService.logWarn("❌ Invalid location in stock update", { location });
        throw new BadRequestError("Location must be a string.");
      }

      StockValidationService.validateStockUpdate(req.body);
      next();
    } catch (error) {
      LoggerService.logError("❌ Stock update validation failed", error);
      next(error);
    }
  }
}

export default ValidateStockMiddleware;
