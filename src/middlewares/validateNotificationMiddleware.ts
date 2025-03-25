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

  static validateSendNotification(req: Request, res: Response, next: NextFunction) {
    const { email, message } = req.body;

    if (!email || typeof email !== "string") {
      return next(new BadRequestError("❌ Email is required and must be a string."));
    }

    if (!message || typeof message !== "string") {
      return next(new BadRequestError("❌ Message is required and must be a string."));
    }

    next();
  }

  static validateAdminNotification(req: Request, res: Response, next: NextFunction) {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return next(new BadRequestError("❌ Message is required for admin notifications."));
    }

    next();
  }

  static validateReminderEmail(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return next(new BadRequestError("❌ Email is required for reminder notifications."));
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
