import winston from "winston";
import LoggerConfig from "../config/LoggerConfig";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

/**
 * ✅ Serviciu pentru logare centralizată (Singleton)
 */
type LogLevel = "info" | "error" | "warn" | "debug";

class LoggerService {
  private static logger: winston.Logger | null = null;

  private constructor() {} // 🔹 Singleton

  /**
   * ✅ Inițializează logger-ul dacă nu există deja
   */
  private static init(): void {
    if (!this.logger) {
      this.logger = winston.createLogger({
        level: LoggerConfig.logLevel || "info",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: "logs/app.log", level: "info" }),
          ...(LoggerConfig.logToFile
            ? [new winston.transports.File({ filename: "logs/error.log", level: "error" })]
            : []),
        ],
      });

      console.log(`📝 Logger initialized: Level ${LoggerConfig.logLevel}, Log to file: ${LoggerConfig.logToFile}`);
    }
  }

  /**
   * 🔹 Logare Generală (Metodă internă)
   */
  private static async log(level: LogLevel, message: string, details?: any) {
    this.init();
    const logData = { level, message, details };

    try {
      this.logger!.log(level, logData);

      // 🔥 Asincron pentru `info`, `warn`, `debug`, dar `await` pentru `error`
      if (level === "error") {
        await EventService.emitEvent(this.getEventType(level), logData);
      } else {
        EventService.emitEvent(this.getEventType(level), logData).catch((error) => {
          console.error(`⚠️ Error emitting log event: ${level}`, error);
        });
      }
    } catch (error) {
      this.handleLoggingError(level, error);
    }
  }

  /**
   * 🔹 Determină tipul de eveniment asociat fiecărui nivel de log
   */
  private static getEventType(level: LogLevel): EventTypes {
    const eventMap: Record<LogLevel, EventTypes> = {
      info: EventTypes.LOG_INFO,
      error: EventTypes.LOG_ERROR,
      warn: EventTypes.LOG_WARN,
      debug: EventTypes.LOG_DEBUG,
    };

    return eventMap[level] ?? EventTypes.LOG_INFO;
  }

  /**
   * 🔹 Gestionarea erorilor de logare
   */
  private static handleLoggingError(level: LogLevel, error: unknown): void {
    if (LoggerConfig.logLevel === "debug") {
      console.error(`⚠️ Error in logger at level ${level}:`, error);
    }
  }

  /**
   * ✅ Logare INFO
   */
  public static async logInfo(message: string, details?: any): Promise<{ success: boolean; message: string }> {
    try {
      await this.log("info", message, details);
      return { success: true, message: "Info log recorded" };
    } catch (error) {
      return { success: false, message: "Failed to record info log" };
    }
  }

  /**
   * ✅ Logare ERROR (mai critică, deci `await` este folosit)
   */
  public static async logError(message: string, error?: any): Promise<{ success: boolean; message: string }> {
    try {
      await this.log("error", message, error);
      return { success: true, message: "Error log recorded" };
    } catch (error) {
      return { success: false, message: "Failed to record error log" };
    }
  }

  /**
   * ✅ Logare WARNING
   */
  public static async logWarn(message: string, details?: any): Promise<{ success: boolean; message: string }> {
    try {
      await this.log("warn", message, details);
      return { success: true, message: "Warning log recorded" };
    } catch (error) {
      return { success: false, message: "Failed to record warning log" };
    }
  }

  /**
   * ✅ Logare DEBUG
   */
  public static async logDebug(message: string, details?: any): Promise<{ success: boolean; message: string }> {
    if (LoggerConfig.logLevel === "debug") {
      try {
        await this.log("debug", message, details);
        return { success: true, message: "Debug log recorded" };
      } catch (error) {
        return { success: false, message: "Failed to record debug log" };
      }
    }
    return { success: false, message: "Debug logging is disabled" };
  }
}

export default LoggerService;
