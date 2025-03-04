import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";

class ValidateNotificationMiddleware {
  static validateSendInvitation(req: Request, res: Response, next: NextFunction) {
    const { email, inviteId } = req.body;
    if (!email || !inviteId) {
      return next(new BadRequestError("Missing required parameters: email or inviteId"));
    }
    next();
  }

  static validateNotifyAdmin(req: Request, res: Response, next: NextFunction) {
    const { email, invitedBy, message } = req.body;
    if (!email || !invitedBy || !message) {
      return next(new BadRequestError("Missing required parameters: email, invitedBy, or message"));
    }
    next();
  }

  static validateSendReminder(req: Request, res: Response, next: NextFunction) {
    const { email, inviteId } = req.body;
    if (!email || !inviteId) {
      return next(new BadRequestError("Missing required parameters: email or inviteId"));
    }
    next();
  }
}

export default ValidateNotificationMiddleware;
