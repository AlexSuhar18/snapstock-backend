import { SendMailOptions, Transporter } from "nodemailer";
import EmailConfig from "../config/EmailConfig";
import LoggerService from "../services/LoggerService";

/**
 * ✅ Enum pentru providerii validați
 */
type EmailProvider = "gmail" | "mailgun" | "sendgrid";

class EmailService {
  private transporter: Transporter;
  private primaryProvider: EmailProvider;
  private backupProvider: EmailProvider | null;

  constructor() {
    // 🔹 Setăm providerii din environment variables
    this.primaryProvider = (process.env.EMAIL_PROVIDER?.toLowerCase() as EmailProvider) || "gmail";
    this.backupProvider = (process.env.BACKUP_EMAIL_PROVIDER?.toLowerCase() as EmailProvider) || null;

    // 🔹 Inițializăm transportul principal
    this.transporter = EmailConfig.getTransporter(this.primaryProvider);
    LoggerService.logInfo(`📧 Primary Email Provider: ${this.primaryProvider}`);

    if (this.backupProvider) {
      LoggerService.logInfo(`🔄 Backup Email Provider: ${this.backupProvider}`);
    }
  }

  /**
   * ✅ Trimite un email cu retry logic și fallback provider
   */
  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    retries = 3
  ): Promise<string> {
    const mailOptions: SendMailOptions = { from: process.env.EMAIL_USER, to, subject, text, html };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.transporter.sendMail(mailOptions);
        LoggerService.logInfo(`📨 Email sent to ${to} on attempt ${attempt}`);
        return `Email sent to ${to}`;
      } catch (error) {
        LoggerService.logError(`❌ Failed attempt ${attempt} to send email to ${to}:`, error);

        if (attempt === retries && this.backupProvider) {
          LoggerService.logWarn(`⚠️ Switching to backup email provider: ${this.backupProvider}`);

          // 🔹 Comutăm pe backup și resetăm numărul de încercări
          this.transporter = EmailConfig.getTransporter(this.backupProvider);
          attempt = 0;
        } else if (attempt === retries) {
          throw new Error(`❌ Email failed after ${retries} attempts to ${to}`);
        }
      }
    }

    return `Failed to send email to ${to}`;
  }
}

export default new EmailService();
