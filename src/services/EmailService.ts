import nodemailer from "nodemailer";
import LoggerService from "./LoggerService";
import EventService from "./EventService";
import { EventTypes } from "../events/EventTypes";
import { ValidationService } from "./ValidationService";

class EmailService {
  private static transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  /**
   * ✅ Trimite un email și returnează un răspuns clar.
   */
  static async sendEmail(to: string, subject: string, text?: string, html?: string) {
    try {
      if (!to || !subject || (!text && !html)) {
        throw new Error("❌ Missing required email parameters.");
      }

      // 🔍 Validare email destinatar
      const isValid = await ValidationService.isValidEmail(to);
      if (!isValid) {
        throw new Error(`❌ Invalid email address: ${to}`);
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!info.messageId) {
        throw new Error("❌ Failed to send email.");
      }

      // 🔥 Emiterea evenimentului doar după succes
      await EventService.emitEvent(EventTypes.EMAIL_SENT, { to, subject });

      LoggerService.logInfo(`📧 Email sent successfully to ${to}`);
      return { success: true, message: `✅ Email sent to ${to}`, messageId: info.messageId };
    } catch (error) {
      LoggerService.logError("❌ Error sending email", error);

      // ✅ Verificăm dacă `error` este de tip `Error`
      const errorMessage = error instanceof Error ? error.message : "❌ An unexpected error occurred.";

      // 🔥 Emitere eveniment de eșec
      try {
        await EventService.emitEvent(EventTypes.EMAIL_FAILED, { to, error: errorMessage });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting EMAIL_FAILED event", eventError);
      }

      return { success: false, error: errorMessage };
    }
  }
}

export default EmailService;
