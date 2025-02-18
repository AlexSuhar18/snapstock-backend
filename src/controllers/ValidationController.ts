import { Request, Response, NextFunction } from "express";
import validator from "validator";
import UserService from "../services/UserService";
import LoggerService from "../services/LoggerService";
import { BadRequestError } from "../errors/CustomErrors";

class ValidationController {
  /**
   * ✅ Validează o parolă (lungime minimă, caracter special, cifră etc.)
   */
  static async validatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body;

      if (!password) {
        throw new BadRequestError("Password is required.");
      }

      const isStrong = validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      });

      if (!isStrong) {
        throw new BadRequestError(
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
        );
      }

      res.status(200).json({ message: "✅ Password is valid." });
    } catch (error) {
      LoggerService.logError("❌ Error validating password.", error);
      next(error);
    }
  }

  /**
   * ✅ Validează un email (format corect)
   */
  static async validateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new BadRequestError("Email is required.");
      }

      if (!validator.isEmail(email)) {
        throw new BadRequestError("Invalid email format.");
      }

      res.status(200).json({ message: "✅ Email is valid." });
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
      const { domain } = req.body;

      if (!domain) {
        throw new BadRequestError("Domain is required.");
      }

      if (!validator.isFQDN(domain)) {
        throw new BadRequestError("Invalid domain format.");
      }

      res.status(200).json({ message: "✅ Domain is valid." });
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
      const { email } = req.body;

      if (!email) {
        throw new BadRequestError("Email is required.");
      }

      const emailExists = await UserService.isEmailTaken(email);

      res.status(emailExists ? 409 : 200).json({
        message: emailExists ? "⚠️ Email is already in use." : "✅ Email is available.",
      });
    } catch (error) {
      LoggerService.logError("❌ Error checking duplicate email.", error);
      next(error);
    }
  }
}

export default ValidationController;
