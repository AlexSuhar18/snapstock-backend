import { Request, Response, NextFunction } from "express";
import LoggerService from "../services/LoggerService";

/**
 * ✅ Middleware pentru gestionarea erorilor în Express într-un mod asincron.
 * - Elimină necesitatea blocurilor `try-catch` în controllere.
 * - Transmite erorile către Express error-handling middleware.
 * - Loghează erorile pentru debugging.
 * 
 * @param fn Funcția asincronă protejată.
 * @returns O funcție Express middleware care capturează și transmite erorile.
 */
export default function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      LoggerService.logError("❌ AsyncHandler caught an error", {
        method: req.method,
        path: req.path,
        ip: req.ip,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      next(error); // ✅ Transmite eroarea către middleware-ul global
    }
  };
}
