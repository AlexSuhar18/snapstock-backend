import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import LoggerService from "../services/LoggerService";
import ProductValidationService from "../services/validation/ProductValidationService";
import ProductRepository from "../repositories/ProductRepository";

class ValidateProductMiddleware {
  /**
   * ✅ Validare creare produs
   */
  static async validateCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { sku, name, price, quantity, currency, unit } = req.body;

      if (!sku || typeof sku !== "string") {
        LoggerService.logWarn("❌ SKU is required and must be a string", { sku });
        throw new BadRequestError("SKU is required and must be a string.");
      }

      if (!name || typeof name !== "string") {
        LoggerService.logWarn("❌ Name is required and must be a string", { name });
        throw new BadRequestError("Name is required and must be a string.");
      }

      if (typeof price !== "number" || price < 0) {
        LoggerService.logWarn("❌ Invalid price", { price });
        throw new BadRequestError("Price must be a non-negative number.");
      }

      if (typeof quantity !== "number" || quantity < 0) {
        LoggerService.logWarn("❌ Invalid quantity", { quantity });
        throw new BadRequestError("Quantity must be a non-negative number.");
      }

      if (!currency || typeof currency !== "string") {
        LoggerService.logWarn("❌ Currency is required and must be a string", { currency });
        throw new BadRequestError("Currency is required and must be a string.");
      }

      if (!unit || typeof unit !== "string") {
        LoggerService.logWarn("❌ Unit is required and must be a string", { unit });
        throw new BadRequestError("Unit is required and must be a string.");
      }

      // 🔎 Validare duplicat SKU
      const existingProduct = await ProductRepository.findBySKU(sku);
      if (existingProduct) {
        LoggerService.logWarn("❌ Duplicate SKU", { sku });
        throw new BadRequestError(`A product with SKU '${sku}' already exists.`);
      }

      ProductValidationService.validateCreateProduct(req.body);
      next();
    } catch (error) {
      LoggerService.logError("❌ Product create validation failed", error);
      next(error);
    }
  }

  /**
   * ✅ Validare actualizare produs
   */
  static validateUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { price, quantity, unit, currency } = req.body;

      if (price !== undefined && (typeof price !== "number" || price < 0)) {
        LoggerService.logWarn("❌ Invalid price on update", { price });
        throw new BadRequestError("Price must be a non-negative number.");
      }

      if (quantity !== undefined && (typeof quantity !== "number" || quantity < 0)) {
        LoggerService.logWarn("❌ Invalid quantity on update", { quantity });
        throw new BadRequestError("Quantity must be a non-negative number.");
      }

      if (unit !== undefined && typeof unit !== "string") {
        LoggerService.logWarn("❌ Invalid unit on update", { unit });
        throw new BadRequestError("Unit must be a string.");
      }

      if (currency !== undefined && typeof currency !== "string") {
        LoggerService.logWarn("❌ Invalid currency on update", { currency });
        throw new BadRequestError("Currency must be a string.");
      }

      ProductValidationService.validateUpdateProduct(req.body);
      next();
    } catch (error) {
      LoggerService.logError("❌ Product update validation failed", error);
      next(error);
    }
  }
}

export default ValidateProductMiddleware;
