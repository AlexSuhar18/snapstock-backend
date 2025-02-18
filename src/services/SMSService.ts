import SMSConfig from '../config/SMSConfig';
import LoggerService from '../services/LoggerService';
import EventService from '../services/EventService';
import SMSRetryHandler from '../utils/SMSRetryHandler';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';
import { EventTypes } from '../events/EventTypes';

/**
 * ✅ Tipuri pentru providerii validați
 */
type SMSProvider = 'twilio' | 'nexmo' | 'plivo';

class SMSService {
  private retryHandler!: SMSRetryHandler;  // ✅ Marcat ca sigur că va fi inițializat
  private primaryProvider: SMSProvider = 'twilio';  // ✅ Inițializat implicit
  private backupProvider: SMSProvider | null = null;  // ✅ Inițializat implicit

  constructor() {
    try {
      ModuleMiddleware.ensureModuleActive('sms');

      this.primaryProvider = (process.env.SMS_PROVIDER?.toLowerCase() as SMSProvider) || 'twilio';
      this.backupProvider = (process.env.BACKUP_SMS_PROVIDER?.toLowerCase() as SMSProvider) || null;
      this.retryHandler = new SMSRetryHandler(this.primaryProvider, this.backupProvider);

      LoggerService.logInfo(`📲 Primary SMS Provider: ${this.primaryProvider}`);
      if (this.backupProvider) {
        LoggerService.logInfo(`🔄 Backup SMS Provider: ${this.backupProvider}`);
      }
    } catch (error) {
      LoggerService.logError('❌ SMS module is disabled or failed to initialize.', error);
      EventService.emitEvent(EventTypes.SMS_MODULE_FAILED, { error });  // ✅ Folosește EventTypes
    }
  }

  /**
   * ✅ Trimite un SMS folosind handler-ul de retry
   */
  public async sendSMS(phoneNumber: string, message: string, retries = 3): Promise<string> {
    try {
      ModuleMiddleware.ensureModuleActive('sms');

      const result = await this.retryHandler.sendSMSWithRetry(phoneNumber, message, retries);
      await EventService.emitEvent(EventTypes.SMS_SENT, { phoneNumber, message });
      return result;
    } catch (error) {
      LoggerService.logError(`❌ Failed to send SMS to ${phoneNumber}`, error);
      await EventService.emitEvent(EventTypes.SMS_FAILED, { phoneNumber, error });
      throw new Error(`SMS sending failed for ${phoneNumber}`);
    }
  }
}

export default new SMSService();
