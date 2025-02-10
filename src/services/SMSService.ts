import SMSConfig from "../config/SMSConfig";
import LoggerService from "../services/LoggerService";

/**
 * ✅ Tipuri pentru providerii validați
 */
type SMSProvider = "twilio" | "nexmo" | "plivo";

class SMSService {
  private client;
  private senderNumber: string;
  private primaryProvider: SMSProvider;
  private backupProvider: SMSProvider | null;

  constructor() {
    // 🔹 Setăm providerii din environment variables
    this.primaryProvider = (process.env.SMS_PROVIDER?.toLowerCase() as SMSProvider) || "twilio";
    this.backupProvider = (process.env.BACKUP_SMS_PROVIDER?.toLowerCase() as SMSProvider) || null;

    // 🔹 Inițializăm clientul principal
    this.client = SMSConfig.getClient(this.primaryProvider);
    this.senderNumber = SMSConfig.getSenderNumber(this.primaryProvider);
    LoggerService.logInfo(`📲 Primary SMS Provider: ${this.primaryProvider}`);

    if (this.backupProvider) {
      LoggerService.logInfo(`🔄 Backup SMS Provider: ${this.backupProvider}`);
    }
  }

  /**
   * ✅ Trimite un SMS cu retry logic și fallback provider
   */
  public async sendSMS(phoneNumber: string, message: string, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.client.messages.create({
          body: message,
          from: this.senderNumber,
          to: phoneNumber,
        });
        LoggerService.logInfo(`📲 SMS sent to ${phoneNumber} on attempt ${attempt}`);
        return `SMS sent to ${phoneNumber}`;
      } catch (error) {
        LoggerService.logError(`❌ Failed attempt ${attempt} to send SMS to ${phoneNumber}:`, error);

        if (attempt === retries && this.backupProvider) {
          LoggerService.logWarn(`⚠️ Switching to backup SMS provider: ${this.backupProvider}`);

          // 🔹 Comutăm pe backup și resetăm numărul de încercări
          this.client = SMSConfig.getClient(this.backupProvider);
          this.senderNumber = SMSConfig.getSenderNumber(this.backupProvider);
          attempt = 0;
        } else if (attempt === retries) {
          throw new Error(`❌ SMS failed after ${retries} attempts to ${phoneNumber}`);
        }
      }
    }

    return `Failed to send SMS to ${phoneNumber}`;
  }
}

export default new SMSService();