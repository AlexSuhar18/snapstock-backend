import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";

class EmailValidationMiddleware {
  static validateEmailFields(req: Request, res: Response, next: NextFunction) {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return next(new BadRequestError("Missing required email fields: to, subject, and either text or html."));
    }

    next(); // Dacă toate câmpurile sunt valide, continuăm către Controller.
  }
}

export default EmailValidationMiddleware;
