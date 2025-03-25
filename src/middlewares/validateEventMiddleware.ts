import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import LoggerService from "../services/LoggerService";
import { EventTypes, EventData } from "../events/EventTypes";

class ValidateEventMiddleware {
  static validate(req: Request, res: Response, next: NextFunction) {
    const { eventType, payload } = req.body;

    // 🔍 Verificăm prezența câmpurilor
    if (!eventType || !payload) {
      LoggerService.logWarn("❌ Missing fields in event:", { eventType, payload });
      return next(new BadRequestError("Missing required fields: eventType and payload."));
    }

    // 🔍 Verificăm dacă eventType e valid
    const validEventTypes = Object.values(EventTypes);
    if (!validEventTypes.includes(eventType)) {
      LoggerService.logWarn("❌ Invalid event type received:", { eventType });
      return next(new BadRequestError(`Invalid event type: ${eventType}`));
    }

    // 🔍 Verificăm structura `payload` pe baza tipului (doar dacă avem definit tipul)
    const expectedFields = Object.keys(({} as EventData)[eventType as keyof EventData] || {});
    const missingFields = expectedFields.filter((field) => !(field in payload));

    if (missingFields.length > 0) {
      LoggerService.logWarn("❌ Invalid payload for event:", {
        eventType,
        missingFields,
        receivedPayload: payload,
      });
      return next(
        new BadRequestError(
          `Payload missing required fields for event "${eventType}": ${missingFields.join(", ")}`
        )
      );
    }

    next();
  }
}

export default ValidateEventMiddleware;
