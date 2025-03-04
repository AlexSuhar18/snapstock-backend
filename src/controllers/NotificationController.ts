import { Request, Response, NextFunction } from "express";
import NotificationService from "../services/NotificationService";
import LoggerService from "../services/LoggerService";

class NotificationController {
  /**
   * ✅ Trimite o invitație
   */
  static async sendInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await NotificationService.sendInvitation(req.body);
      LoggerService.logInfo(`📩 Invitation sent successfully to ${response.email}`);
      res.status(200).json({ message: `Invitation sent to ${response.email}` });
    } catch (error) {
      LoggerService.logError("❌ Error sending invitation", error);
      next(error);
    }
  }

  /**
   * ✅ Trimite o notificare administratorului
   */
  static async notifyAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await NotificationService.notifyAdmin(req.body);
      LoggerService.logInfo(`📢 Admin notification sent: ${response.message}`);
      res.status(200).json({ message: "Admin notification sent successfully" });
    } catch (error) {
      LoggerService.logError("❌ Error notifying admin", error);
      next(error);
    }
  }

  /**
   * ✅ Trimite un reminder prin email
   */
  static async sendReminderEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await NotificationService.sendReminderEmail(req.body);
      LoggerService.logInfo(`🔔 Reminder email sent successfully to ${response.email}`);
      res.status(200).json({ message: `Reminder email sent to ${response.email}` });
    } catch (error) {
      LoggerService.logError("❌ Error sending reminder email", error);
      next(error);
    }
  }
}

export default NotificationController;
