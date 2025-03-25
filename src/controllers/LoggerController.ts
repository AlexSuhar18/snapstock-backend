import { Request, Response, NextFunction } from "express";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import { BadRequestError } from "../errors/CustomErrors";

class LoggerController {
  /**
   * ✅ Logare INFO și emitere eveniment
   */
  static async logInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;

      // 🔹 Validare input
      if (!message || typeof message !== "string") {
        return next(new BadRequestError("Message is required and must be a string."));
      }

      await LoggerService.logInfo(message, details);

      // 🔥 Emitere eveniment INFO
      if (EventTypes.LOG_INFO) {
        await EventService.emitEvent(EventTypes.LOG_INFO, { message, details });
      }

      res.status(200).json({ success: true, message: "✅ Log event recorded" });
    } catch (error) {
      LoggerService.logError("❌ Error logging INFO event", error);
      next(error);
    }
  }

  /**
   * ✅ Logare ERROR și emitere eveniment
   */
  static async logError(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, error } = req.body;

      // 🔹 Validare input
      if (!message || typeof message !== "string") {
        return next(new BadRequestError("Message is required and must be a string."));
      }
      if (!error || typeof error !== "object" || !error.message) {
        return next(new BadRequestError("Error object must contain a message."));
      }

      await LoggerService.logError(message, error);

      // 🔥 Emitere eveniment ERROR
      if (EventTypes.LOG_ERROR) {
        await EventService.emitEvent(EventTypes.LOG_ERROR, { message, error });
      }

      res.status(200).json({ success: true, message: "✅ Error logged successfully" });
    } catch (error) {
      LoggerService.logError("❌ Error logging ERROR event", error);
      next(error);
    }
  }

  /**
   * ✅ Logare WARN și emitere eveniment
   */
  static async logWarn(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;

      // 🔹 Validare input
      if (!message || typeof message !== "string") {
        return next(new BadRequestError("Message is required and must be a string."));
      }

      await LoggerService.logWarn(message, details);

      // 🔥 Emitere eveniment WARN
      if (EventTypes.LOG_WARN) {
        await EventService.emitEvent(EventTypes.LOG_WARN, { message, details });
      }

      res.status(200).json({ success: true, message: "✅ Warning logged successfully" });
    } catch (error) {
      LoggerService.logError("❌ Error logging WARN event", error);
      next(error);
    }
  }

  /**
   * ✅ Logare DEBUG și emitere eveniment
   */
  static async logDebug(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;

      // 🔹 Validare input
      if (!message || typeof message !== "string") {
        return next(new BadRequestError("Message is required and must be a string."));
      }

      await LoggerService.logDebug(message, details);

      // 🔥 Emitere eveniment DEBUG
      if (EventTypes.LOG_DEBUG) {
        await EventService.emitEvent(EventTypes.LOG_DEBUG, { message, details });
      }

      res.status(200).json({ success: true, message: "✅ Debug log recorded" });
    } catch (error) {
      LoggerService.logError("❌ Error logging DEBUG event", error);
      next(error);
    }
  }
}

export default LoggerController;
