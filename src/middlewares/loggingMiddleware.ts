import { Request, Response, NextFunction } from "express";
import logger from "../services/LoggerService";

/**
 * ✅ Middleware pentru gestionarea logării request-urilor și erorilor.
 */
class LoggingMiddleware {
  /**
   * 🔹 Loghează toate request-urile primite
   */
  public static requestLogger(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    logger.info(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`
    );
    next();
  }

  /**
   * 🔹 Loghează erorile globale și trimite un răspuns generic
   */
  public static errorLogger(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    logger.error(`❌ ERROR: ${err.message}`, {
      url: req.url,
      method: req.method,
      stack: err.stack,
      ip: req.ip,
    });

    res.status(500).json({ message: "Internal server error" });
  }
}

export default LoggingMiddleware;
