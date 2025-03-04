import { BadRequestError } from "../../errors/CustomErrors";

export class StockValidationService {
  /**
   * ✅ Validare pentru creare stoc
   */
  static validateCreateStock(data: any) {
    if (!data.name) {
      throw new BadRequestError("Missing required field: name.");
    }
    if (data.quantity === undefined || data.quantity < 0) {
      throw new BadRequestError("Invalid quantity. It must be a positive number.");
    }
    if (!data.productId) {
      throw new BadRequestError("Missing required field: productId.");
    }
  }

  /**
   * ✅ Validare pentru actualizare stoc
   */
  static validateStockUpdate(data: any) {
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new BadRequestError("Invalid quantity. It must be a positive number.");
    }
  }
}
