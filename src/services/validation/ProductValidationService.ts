import { BadRequestError } from "../../errors/CustomErrors";
import { Product } from "../../models/ProductModel";
import LoggerService from "../LoggerService";

class ProductValidationService {
  /**
   * ✅ Validează produsul la creare
   */
  static validateCreateProduct(data: Partial<Product>): void {
    if (!data.name || typeof data.name !== "string") {
      throw new BadRequestError("❌ Product name is required and must be a string.");
    }

    if (!data.sku || typeof data.sku !== "string") {
      throw new BadRequestError("❌ SKU is required and must be a string.");
    }

    if (typeof data.price !== "number" || data.price < 0) {
      throw new BadRequestError("❌ Price must be a non-negative number.");
    }

    if (typeof data.currency !== "string") {
      throw new BadRequestError("❌ Currency must be a string.");
    }

    if (typeof data.quantity !== "number" || data.quantity < 0) {
      throw new BadRequestError("❌ Quantity must be a non-negative number.");
    }

    if (data.unit && typeof data.unit !== "string") {
      throw new BadRequestError("❌ Unit must be a string.");
    }

    if (data.tags && !Array.isArray(data.tags)) {
      throw new BadRequestError("❌ Tags must be an array of strings.");
    }

    if (data.attachments && !Array.isArray(data.attachments)) {
      throw new BadRequestError("❌ Attachments must be an array.");
    }

    if (data.taxRate !== undefined && typeof data.taxRate !== "number") {
      throw new BadRequestError("❌ Tax rate must be a number.");
    }

    if (data.discount !== undefined && typeof data.discount !== "number") {
      throw new BadRequestError("❌ Discount must be a number.");
    }

    if (data.batchTrackingEnabled !== undefined && typeof data.batchTrackingEnabled !== "boolean") {
      throw new BadRequestError("❌ batchTrackingEnabled must be a boolean.");
    }

    if (data.customAttributes && typeof data.customAttributes !== "object") {
      throw new BadRequestError("❌ customAttributes must be an object.");
    }

    if (data.metadata && typeof data.metadata !== "object") {
      throw new BadRequestError("❌ metadata must be an object.");
    }

    LoggerService.logInfo(`✅ Product create payload validated for SKU: ${data.sku}`);
  }

  /**
   * ✅ Validează produsul la actualizare
   */
  static validateUpdateProduct(data: Partial<Product>): void {
    if (!data || typeof data !== "object") {
      throw new BadRequestError("❌ Invalid update data.");
    }

    if (data.price !== undefined && (typeof data.price !== "number" || data.price < 0)) {
      throw new BadRequestError("❌ Price must be a non-negative number.");
    }

    if (data.quantity !== undefined && (typeof data.quantity !== "number" || data.quantity < 0)) {
      throw new BadRequestError("❌ Quantity must be a non-negative number.");
    }

    if (data.taxRate !== undefined && typeof data.taxRate !== "number") {
      throw new BadRequestError("❌ Tax rate must be a number.");
    }

    if (data.discount !== undefined && typeof data.discount !== "number") {
      throw new BadRequestError("❌ Discount must be a number.");
    }

    if (data.unit !== undefined && typeof data.unit !== "string") {
      throw new BadRequestError("❌ Unit must be a string.");
    }

    if (data.batchTrackingEnabled !== undefined && typeof data.batchTrackingEnabled !== "boolean") {
      throw new BadRequestError("❌ batchTrackingEnabled must be a boolean.");
    }

    if (data.tags && !Array.isArray(data.tags)) {
      throw new BadRequestError("❌ Tags must be an array.");
    }

    if (data.attachments && !Array.isArray(data.attachments)) {
      throw new BadRequestError("❌ Attachments must be an array.");
    }

    if (data.customAttributes && typeof data.customAttributes !== "object") {
      throw new BadRequestError("❌ customAttributes must be an object.");
    }

    if (data.metadata && typeof data.metadata !== "object") {
      throw new BadRequestError("❌ metadata must be an object.");
    }

    LoggerService.logInfo(`✏️ Product update payload validated`);
  }

  /**
   * ✅ Validează SKU
   */
  static isValidSKU(sku: string): boolean {
    const regex = /^[A-Za-z0-9_-]{3,}$/;
    return regex.test(sku);
  }

  /**
   * ✅ Verifică dacă un câmp este un ID valid (UUID simplu, extins după nevoie)
   */
  static isValidId(id: string): boolean {
    return typeof id === "string" && id.length >= 8;
  }
}

export default ProductValidationService;
