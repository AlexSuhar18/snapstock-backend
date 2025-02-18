import FirebaseConfig from "../config/firebase";
import { Notification } from "../models/notification";
import BaseRepository from "./BaseRepository";
import { INotificationRepository } from "./Interfaces/INotificationRepository";
import LoggerService from "../services/LoggerService";

const db = FirebaseConfig.getFirestore();
const NOTIFICATION_COLLECTION = "notifications";

class NotificationRepository extends BaseRepository<Notification> implements INotificationRepository {
  constructor() {
    super(NOTIFICATION_COLLECTION);
  }

  /**
   * ✅ Adaugă o nouă notificare în sistem
   */
    /**
   * ✅ Adaugă o nouă notificare în sistem
   */
    async addNotification(userId: string, message: string, type: "email" | "sms" | "push"): Promise<Notification> {
      try {
        if (!["email", "sms", "push"].includes(type)) {
          throw new Error(`Invalid notification type: ${type}`);
        }
  
        const notificationRef = db.collection(NOTIFICATION_COLLECTION).doc();
        const notification: Notification = {
          id: notificationRef.id,
          userId,
          recipient: userId,
          message,
          type,
          createdAt: new Date().toISOString(),
          read: false,
          status: "pending",
        };
  
        await notificationRef.set(notification);
        LoggerService.logInfo(`🔔 Notification created: ${notification.id}`);
        return notification;
      } catch (error) {
        LoggerService.logError("❌ Error adding notification", error);
        throw new Error("Error adding notification");
      }
    }  

  async getAll(): Promise<Notification[]> {
    return await super.getAll();
  }

  async getById(id: string): Promise<Notification | null> {
    return await super.getById(id);
  }

  async delete(id: string): Promise<void> {
    return await super.delete(id);
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    try {
      const snapshot = await db.collection(NOTIFICATION_COLLECTION).where("userId", "==", userId).get();
      return snapshot.docs.map((doc) => new Notification({ id: doc.id, ...doc.data() }));
    } catch (error) {
      LoggerService.logError("❌ Error fetching notifications for user", error);
      throw new Error("Error fetching notifications for user");
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await db.collection(NOTIFICATION_COLLECTION).doc(id).update({ read: true });
      LoggerService.logInfo(`✅ Notification marked as read: ${id}`);
    } catch (error) {
      LoggerService.logError("❌ Error marking notification as read", error);
      throw new Error("Error marking notification as read");
    }
  }
}

export default new NotificationRepository();
