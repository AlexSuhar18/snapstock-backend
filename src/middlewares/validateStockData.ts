import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import { StockValidationService } from "../services/validation/StockValidationService"; // ✅ Corect!

class ValidateStockMiddleware {
  static validateStockCreate(req: Request, res: Response, next: NextFunction) {
    try {
      StockValidationService.validateCreateStock(req.body);
      next();
    } catch (error) {
      next(error); // Pasăm eroarea mai departe către handler-ul global de erori
    }
  }

  static validateStockUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      StockValidationService.validateStockUpdate(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default ValidateStockMiddleware;
