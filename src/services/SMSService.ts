import SMSConfig from "../config/SMSConfig";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import SMSRetryHandler from "../utils/SMSRetryHandler";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";
import { EventTypes } from "../events/EventTypes";

/**
 * ✅ Tipuri pentru providerii validați
 */
type SMSProvider = "twilio" | "nexmo" | "plivo";

/**
 * ✅ Clasă pentru erori specifice serviciului SMS
 */
class SMSServiceError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = "SMSServiceError";
  }
}

class SMSService {
  private retryHandler!: SMSRetryHandler;
  private primaryProvider: SMSProvider = "twilio";
  private backupProvider: SMSProvider | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * ✅ Inițializează serviciul și verifică dacă SMS Module este activ
   */
  private initialize() {
    try {
      ModuleMiddleware.ensureModuleActive("sms");

      this.primaryProvider = (process.env.SMS_PROVIDER?.toLowerCase() as SMSProvider) || "twilio";
      this.backupProvider = (process.env.BACKUP_SMS_PROVIDER?.toLowerCase() as SMSProvider) || null;
      this.retryHandler = new SMSRetryHandler(this.primaryProvider, this.backupProvider);

      LoggerService.logInfo(`📲 Primary SMS Provider: ${this.primaryProvider}`);
      if (this.backupProvider) {
        LoggerService.logInfo(`🔄 Backup SMS Provider: ${this.backupProvider}`);
      }
    } catch (error) {
      LoggerService.logError("❌ SMS module failed to initialize.", error);
      EventService.emitEvent(EventTypes.SMS_MODULE_FAILED, { error: error instanceof Error ? error.message : error });
    }
  }

  /**
   * ✅ Trimite un SMS folosind handler-ul de retry și returnează un obiect cu detalii
   */
  public async sendSMS(phoneNumber: string, message: string, retries = 3): Promise<{ success: boolean; provider: string; messageId?: string }> {
    try {
      ModuleMiddleware.ensureModuleActive("sms");

      const messageId = await this.retryHandler.sendSMSWithRetry(phoneNumber, message, retries);
      await EventService.emitEvent(EventTypes.SMS_SENT, { phoneNumber, provider: this.primaryProvider, message });

      return { success: true, provider: this.primaryProvider, messageId };
    } catch (error) {
      LoggerService.logError(`❌ Failed to send SMS to ${phoneNumber}`, error);
      await EventService.emitEvent(EventTypes.SMS_FAILED, {
        phoneNumber,
        error: error instanceof Error ? error.message : error,
      });

      throw new SMSServiceError(`SMS sending failed for ${phoneNumber}`, error);
    }
  }
}

export default new SMSService();
