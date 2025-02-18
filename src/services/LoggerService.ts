import winston from 'winston';
import LoggerConfig from '../config/LoggerConfig';
import EventService from '../services/EventService';
import { EventTypes } from '../events/EventTypes';

/**
 * ✅ Serviciu pentru logare centralizată (fără erori globale)
 */
class LoggerService {
  private static logger: winston.Logger;

  private constructor() {} // 🔹 Singleton

  /**
   * ✅ Inițializează logger-ul dacă nu există deja
   */
  private static init() {
    if (!this.logger) {
      this.logger = winston.createLogger({
        level: LoggerConfig.logLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: 'logs/app.log', level: 'info' }),
          ...(LoggerConfig.logToFile
            ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' })]
            : []),
        ],
      });

      console.log(`📝 Logger initialized: Level ${LoggerConfig.logLevel}, Log to file: ${LoggerConfig.logToFile}`);
    }
  }

  /**
   * ✅ Logare INFO
   */
  public static async logInfo(message: string, details?: any) {
    this.init();
    const logData = { level: 'info', message, details };
    this.logger.info(logData);
    await EventService.emitEvent(EventTypes.LOG_INFO, logData);
  }

  /**
   * ✅ Logare ERROR
   */
  public static async logError(message: string, error?: any) {
    this.init();
    const logData = { level: 'error', message, error };
    this.logger.error(logData);
    await EventService.emitEvent(EventTypes.LOG_ERROR, logData);
  }

  /**
   * ✅ Logare WARNING
   */
  public static async logWarn(message: string, details?: any) {
    this.init();
    const logData = { level: 'warn', message, details };
    this.logger.warn(logData);
    await EventService.emitEvent(EventTypes.LOG_WARN, logData);
  }

  /**
   * ✅ Logare DEBUG
   */
  public static async logDebug(message: string, details?: any) {
    if (LoggerConfig.logLevel === 'debug') {
      this.init();
      const logData = { level: 'debug', message, details };
      this.logger.debug(logData);
      await EventService.emitEvent(EventTypes.LOG_DEBUG, logData);
    }
  }
}

export default LoggerService;
