import { Request, Response, NextFunction } from "express";
import NotificationService from "../services/NotificationService";
import LoggerService from "../services/LoggerService";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors";
import validateNotificationMiddleware from "../middlewares/validateNotificationMiddleware";

class NotificationController {
  /**
   * ✅ Trimite o invitație
   */
  static async sendInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      // 🔹 Validare input
      validateNotificationMiddleware.validateSendNotification(req, res, next);

      const response = await NotificationService.sendInvitation(req.body);

      LoggerService.logInfo(`📩 Invitation sent successfully to ${response.data?.email}`);
      res.status(200).json({ message: `✅ Invitation sent to ${response.data?.email}` });
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
      // 🔹 Validare input
      validateNotificationMiddleware.validateAdminNotification(req, res, next);

      const response = await NotificationService.notifyAdmin(req.body);

      LoggerService.logInfo(`📢 Admin notification sent: ${response.message}`);
      res.status(200).json({ message: "✅ Admin notification sent successfully" });
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
      // 🔹 Validare input
      validateNotificationMiddleware.validateReminderEmail(req, res, next);

      const response = await NotificationService.sendReminderEmail(req.body);

      LoggerService.logInfo(`📩 Invitation sent successfully to ${response.data?.email}`);
      res.status(200).json({ message: `✅ Invitation sent to ${response.data?.email}` });
    } catch (error) {
      LoggerService.logError("❌ Error sending reminder email", error);
      next(error);
    }
  }

  /**
   * ✅ Obține notificările unui utilizator
   */
  static async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      // 🔹 Verifică dacă userId este valid
      if (!userId || typeof userId !== "string") {
        return next(new BadRequestError("❌ Invalid userId provided."));
      }

      const notifications = await NotificationService.getUserNotifications(userId);

      LoggerService.logInfo(`📨 Notifications retrieved for user: ${userId}`);
      res.status(200).json(notifications);
    } catch (error) {
      LoggerService.logError("❌ Error retrieving notifications", error);
      next(error);
    }
  }

  /**
   * ✅ Marchează o notificare ca citită
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;

      // 🔹 Verifică dacă notificarea există
      const notification = await NotificationService.getNotificationById(notificationId);
      if (!notification) {
        return next(new NotFoundError(`❌ Notification with ID ${notificationId} not found.`));
      }

      await NotificationService.markAsRead(notificationId);

      LoggerService.logInfo(`📖 Notification marked as read: ${notificationId}`);
      res.status(200).json({ message: "✅ Notification marked as read" });
    } catch (error) {
      LoggerService.logError("❌ Error marking notification as read", error);
      next(error);
    }
  }

  /**
   * ✅ Șterge o notificare
   */
  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;

      // 🔹 Verifică dacă notificarea există
      const notification = await NotificationService.getNotificationById(notificationId);
      if (!notification) {
        return next(new NotFoundError(`❌ Notification with ID ${notificationId} not found.`));
      }

      await NotificationService.deleteNotification(notificationId);

      LoggerService.logInfo(`🗑️ Notification deleted: ${notificationId}`);
      res.status(200).json({ message: "✅ Notification deleted successfully" });
    } catch (error) {
      LoggerService.logError("❌ Error deleting notification", error);
      next(error);
    }
  }
}

export default NotificationController;
