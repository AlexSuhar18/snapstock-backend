import { Request, Response, NextFunction } from "express";
import EmailService from "../services/EmailService";
import EmailValidationService from "../services/validation/EmailValidationService";
import EventService from "../services/EventService";
import LoggerService from "../services/LoggerService";
import { EventTypes } from "../events/EventTypes";

class EmailController {
  static async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, subject, text, html } = req.body;

      // 🔹 Validare input
      if (!to || !subject || (!text && !html)) {
        LoggerService.logError("❌ Missing required email fields", { to, subject });
        return res.status(400).json({ error: "❌ Missing required email fields: to, subject, text/html" });
      }

      // 🔹 Validare format email
      if (!EmailValidationService.isValidEmail(to)) {
        LoggerService.logError(`❌ Invalid email format: ${to}`);
        return res.status(400).json({ error: `❌ Invalid email format: ${to}` });
      }

      // 🔹 Apelăm serviciul pentru trimiterea emailului
      await EmailService.sendEmail(to, subject, text, html);

      // 🔥 Emitere eveniment EMAIL_SENT
      await EventService.emitEvent(EventTypes.EMAIL_SENT, { to, subject });

      LoggerService.logInfo(`📧 Email successfully sent to: ${to}`);
      res.status(200).json({ message: `✅ Email sent successfully to ${to}` });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Unknown error");
    
      LoggerService.logError("❌ Error sending email", err);
    
      // 🔥 Emitere eveniment EMAIL_FAILED
      await EventService.emitEvent(EventTypes.EMAIL_FAILED, { to: req.body.to, error: err.message });
    
      next(err); // Pasăm eroarea către Express error handler
    }    
  }
}

export default EmailController;
