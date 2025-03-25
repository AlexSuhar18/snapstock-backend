import { Request, Response, NextFunction } from "express";
import { ValidationService } from "../services/ValidationService";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

class ValidationController {
  /**
   * ✅ Validează o parolă și emite evenimentul PASSWORD_VALIDATED
   */
  static async validatePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ success: false, message: "❌ Password is required." });
      }

      if (ValidationService.isCommonPassword(password)) {
        return res.status(400).json({ success: false, message: "❌ Password is too common and insecure." });
      }

      const isValid = await ValidationService.isStrongPassword(password);

      // 🔥 Emitere eveniment PASSWORD_VALIDATED cu fallback
      try {
        await EventService.emitEvent(EventTypes.PASSWORD_VALIDATED, { password, isStrong: isValid });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting PASSWORD_VALIDATED event", eventError);
      }

      return res.status(isValid ? 200 : 400).json({
        success: isValid,
        message: isValid ? "✅ Password is valid." : "❌ Password is not strong enough.",
      });
    } catch (error) {
      await next(error);
    }
  }

  /**
   * ✅ Validează un email și emite evenimentul EMAIL_VALIDATED
   */
  static async validateEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: "❌ Email is required." });
      }

      const isValid = await ValidationService.isValidEmail(email);

      // 🔥 Emitere eveniment EMAIL_VALIDATED cu fallback
      try {
        await EventService.emitEvent(EventTypes.EMAIL_VALIDATED, { email, isValid });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting EMAIL_VALIDATED event", eventError);
      }

      return res.status(isValid ? 200 : 400).json({
        success: isValid,
        message: isValid ? "✅ Email is valid." : "❌ Invalid email format.",
      });
    } catch (error) {
      await next(error);
    }
  }

  /**
   * ✅ Validează un domeniu
   */
  static async validateDomain(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: "❌ Email is required to validate domain." });
      }

      const isAllowed = await ValidationService.isAllowedDomain(email);
      return res.status(isAllowed ? 200 : 400).json({
        success: isAllowed,
        message: isAllowed ? "✅ Domain is valid." : "❌ Domain is not allowed.",
      });
    } catch (error) {
      await next(error);
    }
  }

  /**
   * ✅ Verifică dacă un email există deja în sistem
   */
  static async checkDuplicateEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: "❌ Email is required to check duplicates." });
      }

      const isDuplicate = await ValidationService.isDuplicateEmail(email, []);
      return res.status(isDuplicate ? 409 : 200).json({
        success: !isDuplicate,
        message: isDuplicate ? "⚠️ Email is already in use." : "✅ Email is available.",
      });
    } catch (error) {
      await next(error);
    }
  }
}

export default ValidationController;
