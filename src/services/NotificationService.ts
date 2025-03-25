import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import LoggerService from "../services/LoggerService";
import { NotFoundError, BadRequestError } from "../errors/CustomErrors";
import { Notification } from "../models/notification";
import NotificationRepository, { NotificationRepository as NotificationRepoClass } from "../repositories/NotificationRepository";

class NotificationService {
  /**
   * ✅ Creează o notificare nouă
   */
  static async createNotification(data: Partial<Notification>): Promise<{ success: boolean; message: string; data?: Notification }> {
    try {
      // 🔍 Validare input
      if (!data.userId || !data.message || !data.recipient) {
        return { success: false, message: "❌ Missing required fields: userId, message, or recipient." };
      }

      if (!["pending", "sent", "failed"].includes(data.status ?? "")) {
        return { success: false, message: "❌ Invalid status value." };
      }

      // 📌 Creăm notificarea folosind modelul `Notification`
      const notification = new Notification({
        id: data.id ?? NotificationRepoClass.generateId(),
        userId: data.userId,
        recipient: data.recipient,
        type: data.type ?? "email",
        message: data.message,
        status: data.status ?? "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sentAt: data.sentAt ?? null,
        errorMessage: data.errorMessage ?? null,
        read: data.read ?? false,
      });

      // 📥 Salvăm notificarea în repository
      const newNotification = await NotificationRepository.create(notification);

      // 🔥 Emitere eveniment
      try {
        await EventService.emitEvent(EventTypes.NOTIFICATION_SENT, {
          email: notification.recipient,
          type: notification.type,
          content: notification.message,
        });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting NOTIFICATION_SENT event", eventError);
      }

      LoggerService.logInfo(`📩 Notification created for user: ${notification.userId}`);

      return { success: true, message: "✅ Notification created successfully", data: newNotification };
    } catch (error) {
      LoggerService.logError("❌ Error creating notification", error);
      return { success: false, message: "❌ Error creating notification" };
    }
  }

  /**
   * ✅ Obține o notificare după ID
   */
  static async getNotificationById(notificationId: string) {
    if (!notificationId) {
      throw new BadRequestError("❌ Notification ID is required.");
    }

    const notification = await NotificationRepository.getById(notificationId);
    if (!notification) {
      throw new NotFoundError(`❌ Notification with ID ${notificationId} not found.`);
    }
    return notification;
  }

  /**
   * ✅ Marchează o notificare ca citită
   */
  static async markAsRead(notificationId: string) {
    try {
      if (!notificationId) {
        throw new BadRequestError("❌ Notification ID is required.");
      }

      const notification = await this.getNotificationById(notificationId);

      const updatedNotification = await this.updateNotification(notificationId, { read: true });

      // 🔥 Emitere eveniment protejat
      try {
        await EventService.emitEvent(EventTypes.NOTIFICATION_READ, { id: notificationId });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting NOTIFICATION_READ event", eventError);
      }

      LoggerService.logInfo(`📖 Notification marked as read: ${notificationId}`);
      return { success: true, message: "✅ Notification marked as read", data: updatedNotification };
    } catch (error) {
      LoggerService.logError("❌ Error marking notification as read", error);
      throw error;
    }
  }

  /**
   * ✅ Șterge o notificare
   */
  static async deleteNotification(notificationId: string) {
    try {
      if (!notificationId) {
        throw new BadRequestError("❌ Notification ID is required.");
      }

      const notification = await this.getNotificationById(notificationId);

      await NotificationRepository.delete(notificationId);

      // 🔥 Emitere eveniment protejat
      try {
        await EventService.emitEvent(EventTypes.NOTIFICATION_DELETED, { id: notificationId });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting NOTIFICATION_DELETED event", eventError);
      }

      LoggerService.logInfo(`🗑️ Notification deleted: ${notificationId}`);
      return { success: true, message: "✅ Notification deleted successfully", id: notificationId };
    } catch (error) {
      LoggerService.logError("❌ Error deleting notification", error);
      throw error;
    }
  }

  /**
   * ✅ Obține notificările unui utilizator
   */
  static async getUserNotifications(userId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!userId || typeof userId !== "string") {
        return { success: false, message: "❌ Invalid userId provided." };
      }

      const notifications = await NotificationRepository.getByUserId(userId);

      if (!notifications || notifications.length === 0) {
        return { success: false, message: `ℹ️ No notifications found for user: ${userId}` };
      }

      // 🔥 Emitere eveniment protejat
      try {
        await EventService.emitEvent(EventTypes.NOTIFICATION_READ, { id: userId });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting NOTIFICATION_READ event", eventError);
      }

      LoggerService.logInfo(`📨 Notifications retrieved for user: ${userId}`);
      return { success: true, message: "✅ Notifications retrieved successfully", data: notifications };
    } catch (error) {
      LoggerService.logError("❌ Error retrieving notifications", error);
      return { success: false, message: "❌ Error retrieving notifications" };
    }
  }

  /**
   * ✅ Actualizează notificarea și setează `updatedAt`
   */
  static async updateNotification(notificationId: string, data: Partial<Notification>) {
    const updatedData = { ...data, updatedAt: new Date().toISOString() };
    return await NotificationRepository.update(notificationId, updatedData);
  }

  /**
   * ✅ Șterge notificările expirate
   */
  static async deleteExpiredNotifications(): Promise<void> {
    try {
      const notifications = await NotificationRepository.getAll();
      const expiredNotifications = notifications.filter(n => new Date(n.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      if (expiredNotifications.length === 0) {
        LoggerService.logInfo("✅ No expired notifications to delete.");
        return;
      }

      const expiredIds = expiredNotifications.map(n => n.id);
      await NotificationRepository.deleteMultiple(expiredIds);

      LoggerService.logInfo(`🗑️ Deleted ${expiredNotifications.length} expired notifications.`);
    } catch (error) {
      LoggerService.logError("❌ Error deleting expired notifications", error);
      throw error;
    }
  }
}

export default NotificationService;
