import { Request, Response, NextFunction } from "express";
import EventService from "../services/EventService";
import LoggerService from "../services/LoggerService";
import { EventTypes } from "../events/EventTypes";

class EventController {
  /**
   * ✅ Emette un eveniment personalizat
   */
  static async emitEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventType, payload } = req.body;

      // 🔹 Apelăm serviciul pentru a emite evenimentul
      await EventService.emitEvent(eventType, payload);

      LoggerService.logInfo(`📢 Event emitted successfully: ${eventType}`, payload);
      res.status(200).json({ message: `Event '${eventType}' emitted successfully`, payload });
    } catch (error) {
      LoggerService.logError("❌ Error emitting event", error);
      next(error);
    }
  }
}

export default EventController;
