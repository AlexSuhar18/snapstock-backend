import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import LoggerService from "../services/LoggerService";

const allowedLevels = ["info", "warn", "error", "debug"];

class ValidateLoggerMiddleware {
  /**
   * ✅ Validează log generic
   */
  static validateLog(req: Request, res: Response, next: NextFunction) {
    const { message, level } = req.body;

    if (!message || typeof message !== "string") {
      LoggerService.logWarn("❌ Invalid log attempt: Missing or invalid message.");
      return next(new BadRequestError("Message is required and must be a string for logging"));
    }

    if (level && !allowedLevels.includes(level)) {
      LoggerService.logWarn(`❌ Invalid log level used: ${level}`);
      return next(new BadRequestError(`Invalid log level. Allowed values: ${allowedLevels.join(", ")}`));
    }

    next();
  }

  /**
   * ✅ Validează log de eroare
   */
  static validateLogError(req: Request, res: Response, next: NextFunction) {
    const { message, error } = req.body;

    if (!message || typeof message !== "string") {
      LoggerService.logWarn("❌ Missing or invalid message in error log.");
      return next(new BadRequestError("Message is required and must be a string"));
    }

    if (!error || typeof error !== "object") {
      LoggerService.logWarn("❌ Missing or invalid error object in error log.");
      return next(new BadRequestError("Error details are required and must be an object"));
    }

    next();
  }
}

export default ValidateLoggerMiddleware;
