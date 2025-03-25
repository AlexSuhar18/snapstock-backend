import { Request, Response, NextFunction } from "express";
import LoggerService from "../services/LoggerService";

/**
 * ✅ Middleware pentru gestionarea erorilor globale
 */
class ErrorHandlingMiddleware {
  /**
   * ✅ Middleware Express pentru capturarea erorilor
   */
  public static handleErrors(err: any, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.status || err.statusCode || 500;
    const errorType = err.name || "InternalServerError";
    const timestamp = new Date().toISOString();

    // 🔥 Logging detaliat
    LoggerService.logError("❌ Error Handler Triggered", {
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      timestamp,
    });

    // 🧠 Detectăm dacă este un request API sau browser
    const acceptsJson = req.headers["accept"]?.includes("application/json");

    if (acceptsJson || req.xhr || req.originalUrl.startsWith("/api")) {
      return res.status(statusCode).json({
        success: false,
        error: {
          type: errorType,
          message: err.message || "Internal Server Error",
          statusCode,
          timestamp,
        },
      });
    }

    // 🔙 Dacă este HTML (ex: pagină în browser)
    return res.status(statusCode).send(`
      <h2>🔥 Eroare: ${statusCode}</h2>
      <p>${err.message}</p>
    `);
  }

  /**
   * ✅ Capturăm erorile globale (uncaughtException și unhandledRejection)
   */
  public static initGlobalErrorHandlers() {
    process.on("uncaughtException", (err) => {
      LoggerService.logError("🔥 Uncaught Exception", {
        message: err.message,
        stack: err.stack,
        pid: process.pid,
        timestamp: new Date().toISOString(),
      });
      process.exit(1);
    });

    process.on("unhandledRejection", (reason: any, promise) => {
      LoggerService.logError("🚨 Unhandled Promise Rejection", {
        reason,
        promise,
        pid: process.pid,
        timestamp: new Date().toISOString(),
      });
    });
  }
}

export default ErrorHandlingMiddleware;
