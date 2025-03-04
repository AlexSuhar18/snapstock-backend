import { Request, Response, NextFunction } from "express";
import { ValidationService } from "../services/ValidationService";
import LoggerService from "../services/LoggerService";

class ValidationController {
  /**
   * ✅ Validează o parolă
   */
  static async validatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ message: "❌ Password is required." });
        return;
      }

      if (ValidationService.isCommonPassword(password)) {
        res.status(400).json({ message: "❌ Password is too common and insecure." });
        return;
      }

      const isValid = await ValidationService.isStrongPassword(password);
      res.status(isValid ? 200 : 400).json({
        message: isValid ? "✅ Password is valid." : "❌ Password is not strong enough.",
      });
    } catch (error) {
      LoggerService.logError("❌ Error validating password.", error);
      next(error);
    }
  }

  /**
   * ✅ Verifică dacă o parolă este comună
   */
  static async checkCommonPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ message: "❌ Password is required." });
        return;
      }

      const isCommon = ValidationService.isCommonPassword(password);
      res.status(isCommon ? 400 : 200).json({
        message: isCommon ? "⚠️ Password is too common and insecure." : "✅ Password is unique.",
      });
    } catch (error) {
      LoggerService.logError("❌ Error checking common password.", error);
      next(error);
    }
  }

  /**
   * ✅ Validează un email
   */
  static async validateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isValid = await ValidationService.isValidEmail(req.body.email);
      res.status(isValid ? 200 : 400).json({
        message: isValid ? "✅ Email is valid." : "❌ Invalid email format.",
      });
    } catch (error) {
      LoggerService.logError("❌ Error validating email.", error);
      next(error);
    }
  }

  /**
   * ✅ Validează un domeniu web
   */
  static async validateDomain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAllowed = await ValidationService.isAllowedDomain(req.body.email);
      res.status(isAllowed ? 200 : 400).json({
        message: isAllowed ? "✅ Domain is valid." : "❌ Domain is not allowed.",
      });
    } catch (error) {
      LoggerService.logError("❌ Error validating domain.", error);
      next(error);
    }
  }

  /**
   * ✅ Verifică dacă un email există deja în sistem (email duplicat)
   */
  static async checkDuplicateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isDuplicate = await ValidationService.isDuplicateEmail(req.body.email, []);
      res.status(isDuplicate ? 409 : 200).json({
        message: isDuplicate ? "⚠️ Email is already in use." : "✅ Email is available.",
      });
    } catch (error) {
      LoggerService.logError("❌ Error checking duplicate email.", error);
      next(error);
    }
  }
}

export default ValidationController;
