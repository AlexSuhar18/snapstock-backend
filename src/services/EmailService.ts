import EmailConfig from '../config/EmailConfig';
import LoggerService from '../services/LoggerService';
import EventService from '../services/EventService';
import { EventTypes } from '../events/EventTypes';

class EmailService {
  private transporter = EmailConfig.getTransporter();
  private backupProvider: 'gmail' | 'mailgun' | 'sendgrid' | null =
    (process.env.BACKUP_EMAIL_PROVIDER as 'gmail' | 'mailgun' | 'sendgrid') || null;

  /**
   * ✅ Trimite un email cu retry logic și fallback provider
   */
  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    retries = 3
  ): Promise<void> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        attempt++;
        await this.transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          subject,
          text,
          html,
        });

        LoggerService.logInfo(`📨 Email sent to ${to} on attempt ${attempt}`);
        await EventService.emitEvent(EventTypes.EMAIL_SENT, { to, subject });
        return;
      } catch (error: unknown) { // Explicităm tipul ca `unknown`
        const errorMessage = error instanceof Error ? error.message : String(error);

        LoggerService.logError(`❌ Failed attempt ${attempt} to send email to ${to}:`, errorMessage);

        if (attempt === retries) {
          if (this.backupProvider) {
            LoggerService.logWarn(`⚠️ Switching to backup email provider: ${this.backupProvider}`);
            this.transporter = EmailConfig.getTransporter(this.backupProvider);
            attempt = 0; // 🔹 Resetăm încercările pentru noul provider
          } else {
            await EventService.emitEvent(EventTypes.EMAIL_FAILED, { to, error: errorMessage });
            throw new Error(`❌ Error sending email after multiple attempts: ${errorMessage}`);
          }
        }
      }
    }
  }
}

export default new EmailService();
