import { INotificationRepository } from "../Interfaces/INotificationRepository";
import { Notification } from "../models/notification";
import BaseRepository from "./BaseRepository";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import LoggerService from "../services/LoggerService";
import crypto from "crypto";

class NotificationRepository extends BaseRepository<Notification> implements INotificationRepository {
  constructor() {
    super("notifications");
  }

  /**
   * ✅ Generează un ID unic pentru notificări
   */
  static generateId(): string {
    return crypto.randomUUID(); // Alternativ: return crypto.randomBytes(16).toString("hex");
  }

  async addNotification(userId: string, message: string, type: "email" | "sms" | "push"): Promise<Notification> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid userId.");
    }
    if (!["email", "sms", "push"].includes(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    const notificationData = new Notification({
      id: NotificationRepository.generateId(), // 🔹 Folosim metoda nouă pentru ID unic
      userId,
      recipient: userId,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
      status: "pending",
    });

    const newNotification = await super.create(notificationData);

    try {
      await EventService.emitEvent(EventTypes.NOTIFICATION_SENT, {
        email: userId,
        type: newNotification.type,
        content: newNotification.message,
      });
    } catch (error) {
      LoggerService.logError(`❌ Failed to emit NOTIFICATION_SENT event: ${error}`);
    }

    LoggerService.logInfo(`🔔 Notification created: ${newNotification.id}`);
    return newNotification;
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid userId.");
    }
    const notifications = await this.getByField("userId", userId);
    return notifications ? (Array.isArray(notifications) ? notifications : [notifications]) : [];
  }

  async delete(id: string): Promise<Notification> {
    const notification = await this.getById(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found.`);
    }

    await super.delete(id);
    try {
      await EventService.emitEvent(EventTypes.NOTIFICATION_DELETED, { id });
    } catch (error) {
      LoggerService.logError(`❌ Failed to emit NOTIFICATION_DELETED event: ${error}`);
    }

    LoggerService.logInfo(`🗑️ Notification deleted: ${id}`);
    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.getById(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found.`);
    }

    await this.update(id, { read: true });
    const updatedNotification = await this.getById(id);
    if (!updatedNotification) {
      throw new Error(`Notification with ID ${id} not found after marking as read.`);
    }

    try {
      await EventService.emitEvent(EventTypes.NOTIFICATION_READ, { id });
    } catch (error) {
      LoggerService.logError(`❌ Failed to emit NOTIFICATION_READ event: ${error}`);
    }

    LoggerService.logInfo(`✅ Notification marked as read: ${id}`);
    return updatedNotification;
  }

  async getById(id: string): Promise<Notification> {
    return await super.getById(id);
  }

  async update(id: string, notification: Partial<Notification>): Promise<Notification> {
    await super.update(id, notification);
    const updatedNotification = await this.getById(id);
    if (!updatedNotification) {
      throw new Error(`Notification with ID ${id} not found after update.`);
    }
    return updatedNotification;
  }
}

export default new NotificationRepository();
export { NotificationRepository }; 
