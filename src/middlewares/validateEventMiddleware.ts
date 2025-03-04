import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import { EventTypes } from "../events/EventTypes";

class ValidateEventMiddleware {
  static validate(req: Request, res: Response, next: NextFunction) {
    const { eventType, payload } = req.body;

    if (!eventType || !payload) {
      return next(new BadRequestError("Missing required fields: eventType and payload."));
    }

    if (!(eventType in EventTypes)) {
      return next(new BadRequestError(`Invalid event type: ${eventType}`));
    }

    next();
  }
}

export default ValidateEventMiddleware;
