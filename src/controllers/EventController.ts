import { Request, Response, NextFunction } from "express";
import EventService from "../services/EventService";
import LoggerService from "../services/LoggerService";
import { BadRequestError } from "../errors/CustomErrors";
import { EventTypes, EventData } from "../events/EventTypes";

class EventController {
  /**
   * ✅ Emette un eveniment personalizat
   */
  static async emitEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventType, payload } = req.body;

      if (!eventType || !payload) {
        throw new BadRequestError("Missing required fields: eventType and payload.");
      }

      if (!(eventType in EventTypes)) {
        throw new BadRequestError(`Invalid event type: ${eventType}`);
      }

      // 🔥 Emiterea evenimentului cu payload-ul primit
      await EventService.emitEvent(eventType as EventTypes, payload as EventData[EventTypes]);

      LoggerService.logInfo(`📢 Event emitted: ${eventType}`, payload);
      res.status(200).json({ message: `Event ${eventType} emitted successfully`, payload });
    } catch (error) {
      LoggerService.logError("❌ Error emitting event", error);
      next(error);
    }
  }
}

export default EventController;
