import { Request, Response, NextFunction } from "express";
import LoggerService from "../services/LoggerService";

class LoggerController {
  /**
   * ✅ Logare INFO și emitere eveniment
   */
  static async logInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;
      await LoggerService.logInfo(message, details);
      res.status(200).json({ success: true, message: "Log event recorded" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ Logare ERROR și emitere eveniment
   */
  static async logError(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, error } = req.body;
      await LoggerService.logError(message, error);
      res.status(200).json({ success: true, message: "Error logged successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ Logare WARN și emitere eveniment
   */
  static async logWarn(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;
      await LoggerService.logWarn(message, details);
      res.status(200).json({ success: true, message: "Warning logged successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ Logare DEBUG și emitere eveniment
   */
  static async logDebug(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;
      await LoggerService.logDebug(message, details);
      res.status(200).json({ success: true, message: "Debug log recorded" });
    } catch (error) {
      next(error);
    }
  }
}

export default LoggerController;
