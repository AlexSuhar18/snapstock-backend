import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

/**
 * ✅ Serviciu pentru logare centralizată
 */
class LoggerService {
  private static logger: winston.Logger;

  private constructor() {} // 🔹 Constructor privat pentru Singleton

  /**
   * ✅ Inițializează logger-ul (Singleton Pattern)
   */
  private static init() {
    if (!this.logger) {
      const logLevel = process.env.LOG_LEVEL || "info"; // 🔹 Setează nivelul de logare
      const logToFile = process.env.LOG_TO_FILE === "true"; // 🔹 Activează logarea în fișier dacă este setat

      this.logger = winston.createLogger({
        level: logLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
          })
        ),
        transports: [
          new winston.transports.Console(), // ✅ Log în terminal
          ...(logToFile
            ? [new winston.transports.File({ filename: "logs/error.log", level: "error" })]
            : []),
        ],
      });

      console.log(`📝 Logger initialized with level: ${logLevel}, Log to file: ${logToFile}`);
    }
  }

  /**
   * ✅ Logare de tip INFO
   */
  public static logInfo(message: string) {
    this.init();
    this.logger.info(message);
  }

  /**
   * ✅ Logare de tip ERROR
   */
  public static logError(message: string, error?: any) {
    this.init();
    this.logger.error(message);
    if (error) console.error(error);
  }

  /**
   * ✅ Logare de tip WARN
   */
  public static logWarn(message: string) {
    this.init();
    this.logger.warn(message);
  }

  /**
   * ✅ Logare de tip DEBUG (pentru dezvoltare)
   */
  public static logDebug(message: string) {
    if (process.env.LOG_LEVEL === "debug") {
      this.init();
      this.logger.debug(message);
    }
  }

  /**
   * ✅ Logare evenimente pentru integrare cu sisteme de monitorizare
   */
  public static logEvent(eventName: string, details?: any) {
    this.init();
    this.logger.info(`📢 EVENT: ${eventName}`, details);
  }
}

export default LoggerService;