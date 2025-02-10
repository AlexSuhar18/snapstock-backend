import EmailConfig from "../config/EmailConfig";
import LoggerService from "./LoggerService";

class EmailService {
  private transporter = EmailConfig.getTransporter();
  private backupProvider: "gmail" | "mailgun" | "sendgrid" | null = process.env.BACKUP_EMAIL_PROVIDER as any || null;

  /**
   * ✅ Trimite un email cu retry logic și fallback provider
   */
  public async sendEmail(to: string, subject: string, text: string, html?: string, retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, html });
        LoggerService.logInfo(`📨 Email sent to ${to} on attempt ${attempt}`);
        return; // ✅ Ieșim din loop dacă emailul este trimis cu succes
      } catch (error) {
        LoggerService.logError(`❌ Failed attempt ${attempt} to send email to ${to}:`, error);

        if (attempt === retries && this.backupProvider) {
          LoggerService.logWarn(`⚠️ Switching to backup email provider: ${this.backupProvider}`);
          this.transporter = EmailConfig.getTransporter(this.backupProvider);
          attempt = 0; // 🔹 Resetăm încercările pentru noul provider
        } else if (attempt === retries) {
          throw new Error("❌ Error sending email after multiple attempts");
        }
      }
    }
  }
}

export default new EmailService();
