import { Request, Response, NextFunction } from "express";
import LoggerService from "../services/LoggerService";

/**
 * ✅ Middleware pentru gestionarea erorilor globale
 */
class ErrorHandlingMiddleware {
  public static handleErrors(err: Error, req: Request, res: Response, next: NextFunction) {
    LoggerService.logError(`❌ Error: ${err.message}`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  /**
   * ✅ Capturăm erorile globale (uncaughtException și unhandledRejection)
   */
  public static initGlobalErrorHandlers() {
    process.on("uncaughtException", (err) => {
      LoggerService.logError("🔥 Uncaught Exception:", err);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      LoggerService.logError("🚨 Unhandled Promise Rejection:", { reason, promise });
    });
  }
}

export default ErrorHandlingMiddleware;
