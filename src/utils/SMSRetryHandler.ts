import SMSConfig from '../config/SMSConfig';
import LoggerService from '../services/LoggerService';
import eventBus from '../events/EventBus';

type SMSProvider = 'twilio' | 'nexmo' | 'plivo';

class SMSRetryHandler {
  private client;
  private senderNumber: string;
  private primaryProvider: SMSProvider;
  private backupProvider: SMSProvider | null;

  constructor(primaryProvider: SMSProvider, backupProvider: SMSProvider | null) {
    this.primaryProvider = primaryProvider;
    this.backupProvider = backupProvider;
    this.client = SMSConfig.getClient(this.primaryProvider);
    this.senderNumber = SMSConfig.getSenderNumber(this.primaryProvider);
  }

  async sendSMSWithRetry(phoneNumber: string, message: string, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.client.messages.create({
          body: message,
          from: this.senderNumber,
          to: phoneNumber,
        });
        LoggerService.logInfo(`📲 SMS sent to ${phoneNumber} on attempt ${attempt}`);
        eventBus.emit('smsSent', { phoneNumber, message });
        return `SMS sent to ${phoneNumber}`;
      } catch (error) {
        LoggerService.logError(`❌ Failed attempt ${attempt} to send SMS to ${phoneNumber}:`, error);

        if (attempt === retries && this.backupProvider) {
          LoggerService.logWarn(`⚠️ Switching to backup SMS provider: ${this.backupProvider}`);
          this.client = SMSConfig.getClient(this.backupProvider);
          this.senderNumber = SMSConfig.getSenderNumber(this.backupProvider);
          attempt = 0;
        } else if (attempt === retries) {
          eventBus.emit('smsFailed', { phoneNumber, error });
          throw new Error(`❌ SMS failed after ${retries} attempts to ${phoneNumber}`);
        }
      }
    }
    return `Failed to send SMS to ${phoneNumber}`;
  }
}

export default SMSRetryHandler;
