import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import { ValidationService } from "../services/ValidationService";
import LoggerService from "../services/LoggerService";

class EmailValidationMiddleware {
  /**
   * ✅ Middleware pentru validarea câmpurilor unui email
   */
  static async validateEmailFields(req: Request, res: Response, next: NextFunction) {
    const { to, subject, text, html } = req.body;

    // 🔍 Identificăm ce câmpuri lipsesc
    const missingFields = [];
    if (!to) missingFields.push("to");
    if (!subject) missingFields.push("subject");
    if (!text && !html) missingFields.push("text or html");

    if (missingFields.length > 0) {
      LoggerService.logWarn(`🚫 Email validation failed: Missing fields - ${missingFields.join(", ")}`, {
        ip: req.ip,
        method: req.method,
        body: req.body,
      });
      return next(new BadRequestError(`Missing required email fields: ${missingFields.join(", ")}`));
    }

    // ✅ Validăm adresa de email
    const isValidEmail = await ValidationService.isValidEmail(to);
    if (!isValidEmail) {
      LoggerService.logWarn(`🚫 Invalid email format: ${to}`, {
        ip: req.ip,
        method: req.method,
        body: req.body,
      });
      return next(new BadRequestError("Invalid email format."));
    }

    next(); // 🔹 Dacă totul este valid, continuăm către controller.
  }
}

export default EmailValidationMiddleware;
