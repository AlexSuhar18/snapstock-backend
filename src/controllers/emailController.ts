import { Request, Response, NextFunction } from "express";
import EmailService from "../services/EmailService";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { BadRequestError } from "../errors/CustomErrors";
import { EventTypes } from "../events/EventTypes";

class EmailController {
  /**
   * ✅ Trimite un email
   */
  static async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, subject, text, html } = req.body;

      if (!to || !subject || (!text && !html)) {
        throw new BadRequestError("Missing required email fields: to, subject, and either text or html.");
      }

      await EmailService.sendEmail(to, subject, text, html);

      // 🔥 Emiterea evenimentului după trimiterea emailului
      await EventService.emitEvent(EventTypes.EMAIL_SENT, { to, subject });

      LoggerService.logInfo(`📧 Email sent successfully to ${to}`);
      res.status(200).json({ message: `Email sent to ${to}` });
    } catch (error) {
      LoggerService.logError("❌ Error sending email", error);
      next(error);
    }
  }
}

export default EmailController;
