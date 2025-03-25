import nodemailer, { Transporter } from "nodemailer";
import { emailConfig } from "../config/email";
import LoggerService from "../services/LoggerService";

class EmailConfig {
  private static transporter: Transporter | null = null;
  private constructor() {}

  /**
   * ✅ Inițializează și returnează un transport Nodemailer pentru providerul specificat
   */
  public static getTransporter(provider?: "gmail" | "mailgun" | "sendgrid" | "custom"): Transporter {
    const selectedProvider = provider || emailConfig.provider;

    // ✅ Validare pentru variabilele de mediu necesare
    const emailSettings = emailConfig.providers[selectedProvider];

    if (!emailSettings.auth.user || !emailSettings.auth.pass) {
      throw new Error(
        `❌ Missing email credentials for ${selectedProvider}. Please check your .env file.`
      );
    }

    // ✅ Inițializează Nodemailer doar dacă nu este deja inițializat sau providerul s-a schimbat
    if (!this.transporter || selectedProvider !== emailConfig.provider) {
      try {
        this.transporter = nodemailer.createTransport(emailSettings);
        LoggerService.logInfo(`📧 Email provider set to: ${selectedProvider}`);
      } catch (error) {
        LoggerService.logError(`❌ Failed to configure email provider: ${selectedProvider}`, error);
        throw new Error(`❌ Could not initialize email transporter: ${error}`);
      }
    }

    return this.transporter;
  }

  /**
   * ✅ Returnează adresa de email default "from"
   */
  public static getDefaultSender(): string {
    const defaultSender = process.env.EMAIL_FROM || emailConfig.providers[emailConfig.provider].auth.user;

    if (!defaultSender) {
      LoggerService.logWarn("⚠️ No default sender email configured.");
      return "";
    }

    return defaultSender;
  }
}

export default EmailConfig;
