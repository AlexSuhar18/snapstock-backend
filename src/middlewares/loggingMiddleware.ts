import { Request, Response, NextFunction } from "express";
import LoggerService from "../services/LoggerService";

const LOGGING_ENABLED = process.env.LOGGING_ENABLED !== "false";

/**
 * ✅ Middleware pentru gestionarea logării request-urilor și erorilor.
 */
class LoggingMiddleware {
  /**
   * 🔹 Loghează toate request-urile primite
   */
  public static async requestLogger(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!LOGGING_ENABLED) return next();

    const sanitizedHeaders = { ...req.headers };
    if (sanitizedHeaders.authorization) sanitizedHeaders.authorization = "[REDACTED]";

    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = "[REDACTED]";
    if (sanitizedBody.token) sanitizedBody.token = "[REDACTED]";

    await LoggerService.logInfo(`📥 [REQUEST] ${req.method} ${req.url}`, {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      headers: sanitizedHeaders,
      body: sanitizedBody,
      query: req.query,
    });

    next();
  }

  /**
   * 🔹 Loghează erorile globale și trimite un răspuns generic
   */
  public static async errorLogger(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (LOGGING_ENABLED) {
      const sanitizedHeaders = { ...req.headers };
      if (sanitizedHeaders.authorization) sanitizedHeaders.authorization = "[REDACTED]";

      await LoggerService.logError(`❌ [ERROR] ${err.message}`, {
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        stack: err.stack,
        ip: req.ip,
        headers: sanitizedHeaders,
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }

  /**
   * 🔹 Loghează un warning
   */
  public static async warnLogger(message: string, details?: any): Promise<void> {
    if (!LOGGING_ENABLED) return;
    await LoggerService.logWarn(`⚠️ [WARNING] ${message}`, {
      ...details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 🔹 Loghează mesaje de debugging
   */
  public static async debugLogger(message: string, details?: any): Promise<void> {
    if (!LOGGING_ENABLED) return;
    await LoggerService.logDebug(`🐛 [DEBUG] ${message}`, {
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
}

export default LoggingMiddleware;
