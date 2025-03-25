import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import LoggerService from "../services/LoggerService"; // ✅ Logging adăugat

class ValidateInputMiddleware {
  /**
   * ✅ Validează existența și tipul parolei
   */
  static validatePassword(req: Request, res: Response, next: NextFunction) {
    const password = req.body.password;

    if (password === undefined || password === null) {
      LoggerService.logWarn("❌ Missing password field in request body.");
      return next(new BadRequestError("Password is required."));
    }

    if (typeof password !== "string") {
      LoggerService.logWarn("❌ Invalid password type:", { password });
      return next(new BadRequestError("Password must be a string."));
    }

    next();
  }

  /**
   * ✅ Validează existența și tipul emailului
   */
  static validateEmail(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email;

    if (!email) {
      LoggerService.logWarn("❌ Missing email field in request body.");
      return next(new BadRequestError("Email is required."));
    }

    if (typeof email !== "string") {
      LoggerService.logWarn("❌ Invalid email type:", { email });
      return next(new BadRequestError("Email must be a string."));
    }

    next();
  }

  /**
   * ✅ Validează existența și tipul domeniului
   */
  static validateDomain(req: Request, res: Response, next: NextFunction) {
    const domain = req.body.domain;

    if (!domain) {
      LoggerService.logWarn("❌ Missing domain field in request body.");
      return next(new BadRequestError("Domain is required."));
    }

    if (typeof domain !== "string") {
      LoggerService.logWarn("❌ Invalid domain type:", { domain });
      return next(new BadRequestError("Domain must be a string."));
    }

    next();
  }

  /**
   * 🔧 ✅ Funcție reutilizabilă pentru validări personalizate
   */
  static validateField(fieldName: string, expectedType: "string" | "number" | "boolean") {
    return (req: Request, res: Response, next: NextFunction) => {
      const value = req.body[fieldName];

      if (value === undefined || value === null) {
        LoggerService.logWarn(`❌ Missing required field: ${fieldName}`);
        return next(new BadRequestError(`${fieldName} is required.`));
      }

      if (typeof value !== expectedType) {
        LoggerService.logWarn(`❌ Invalid type for field: ${fieldName}`, { value });
        return next(new BadRequestError(`${fieldName} must be a ${expectedType}.`));
      }

      next();
    };
  }
}

export default ValidateInputMiddleware;
