import { Request, Response, NextFunction } from "express";
import EventService from "../services/EventService";
import LoggerService from "../services/LoggerService";
import { EventTypes, EventData } from "../events/EventTypes";
import { ValidationError } from "../errors/CustomErrors";

class EventController {
  /**
   * ✅ Emette un eveniment personalizat
   */
  static async emitEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventType, payload } = req.body;

      // 🔹 Verificăm dacă eventType este valid
      if (!(eventType in EventTypes)) {
        LoggerService.logError(`❌ Invalid event type: ${eventType}`);
        return res.status(400).json({ error: `❌ Invalid event type: ${eventType}` });
      }

      // 🔹 Validare eveniment folosind middleware
      if (!EventController.validateEventPayload(eventType, payload)) {
        LoggerService.logError(`❌ Invalid payload for event: ${eventType}`, payload);
        return res.status(400).json({ error: `❌ Invalid payload for event: ${eventType}` });
      }

      await EventService.emitEvent(eventType, payload);

      LoggerService.logInfo(`📢 Event emitted successfully: ${eventType}`, payload);
      res.status(200).json({ message: `✅ Event '${eventType}' emitted successfully`, payload });
    } catch (error) {
      LoggerService.logError("❌ Error emitting event", error);

      return res.status(500).json({
        error: "❌ Internal server error while emitting event",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * ✅ Verifică structura payload-ului evenimentului
   */
  private static validateEventPayload<T extends keyof EventData>(eventType: T, payload: any): boolean {
    const expectedKeys = Object.keys(payload);
    return expectedKeys.every((key) => key in payload);
  }  
}

export default EventController;
