import winston from "winston";
import LoggerConfig from "../config/LoggerConfig";

/**
 * ✅ Serviciu pentru logare centralizată (fără erori globale)
 */
class LoggerService {
  private static logger: winston.Logger;

  private constructor() {} // 🔹 Singleton

  /**
   * ✅ Inițializează logger-ul (fără erori globale)
   */
  private static init() {
    if (!this.logger) {
      this.logger = winston.createLogger({
        level: LoggerConfig.logLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
          })
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: "logs/app.log", level: "info" }),
          ...(LoggerConfig.logToFile
            ? [new winston.transports.File({ filename: "logs/error.log", level: "error" })]
            : [])
        ],
      });

      console.log(`📝 Logger initialized: Level ${LoggerConfig.logLevel}, Log to file: ${LoggerConfig.logToFile}`);
    }
  }

  /**
   * ✅ Logare INFO cu opțiunea de a include detalii suplimentare
   */
  public static logInfo(message: string, details?: any) {
    this.init();
    if (details) {
      this.logger.info(`${message} | Details: ${JSON.stringify(details)}`);
    } else {
      this.logger.info(message);
    }
  }

  /**
   * ✅ Logare ERROR cu detalii suplimentare
   */
  public static logError(message: string, error?: any) {
    this.init();
    if (error) {
      this.logger.error(`${message} | Error: ${JSON.stringify(error)}`);
    } else {
      this.logger.error(message);
    }
  }

  /**
   * ✅ Logare WARNING cu opțiunea de a include detalii suplimentare
   */
  public static logWarn(message: string, details?: any) {
    this.init();
    if (details) {
      this.logger.warn(`${message} | Details: ${JSON.stringify(details)}`);
    } else {
      this.logger.warn(message);
    }
  }

  /**
   * ✅ Logare DEBUG pentru debugging avansat
   */
  public static logDebug(message: string, details?: any) {
    if (LoggerConfig.logLevel === "debug") {
      this.init();
      if (details) {
        this.logger.debug(`${message} | Details: ${JSON.stringify(details)}`);
      } else {
        this.logger.debug(message);
      }
    }
  }
}

export default LoggerService;