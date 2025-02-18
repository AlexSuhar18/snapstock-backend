import { Request, Response, NextFunction } from "express";
import LoggerService from "../services/LoggerService";

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
    await LoggerService.logInfo(`📥 [REQUEST] ${req.method} ${req.url}`, {
      ip: req.ip,
      headers: req.headers,
      body: req.body,
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
    await LoggerService.logError(`❌ [ERROR] ${err.message}`, {
      url: req.url,
      method: req.method,
      stack: err.stack,
      ip: req.ip,
      headers: req.headers,
    });

    res.status(500).json({ message: "Internal server error" });
  }

  /**
   * 🔹 Loghează un warning
   */
  public static async warnLogger(
    message: string,
    details?: any
  ): Promise<void> {
    await LoggerService.logWarn(`⚠️ [WARNING] ${message}`, details);
  }

  /**
   * 🔹 Loghează mesaje de debugging
   */
  public static async debugLogger(
    message: string,
    details?: any
  ): Promise<void> {
    await LoggerService.logDebug(`🐛 [DEBUG] ${message}`, details);
  }
}

export default LoggingMiddleware;
