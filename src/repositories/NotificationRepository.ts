import { INotificationRepository } from "../Interfaces/INotificationRepository";
import { Notification } from "../models/notification";
import BaseRepository from "./BaseRepository";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import LoggerService from "../services/LoggerService";

class NotificationRepository extends BaseRepository<Notification> implements INotificationRepository {
  constructor() {
    super("notifications");
  }

  async addNotification(userId: string, message: string, type: "email" | "sms" | "push"): Promise<Notification> {
    if (!["email", "sms", "push"].includes(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    const notificationData = new Notification({
      id: this.db.generateId(this.collectionName),
      userId,
      recipient: userId,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
      status: "pending",
    });

    const newNotification = await super.create(notificationData);

    await EventService.emitEvent(EventTypes.NOTIFICATION_SENT, {
      email: userId,
      type: newNotification.type,
      content: newNotification.message,
    });

    LoggerService.logInfo(`🔔 Notification created: ${newNotification.id}`);
    return newNotification;
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.getByField("userId", userId);
    return notifications ? (Array.isArray(notifications) ? notifications : [notifications]) : [];
  }

  async delete(id: string): Promise<Notification> {
    const notification = await this.getById(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found.`);
    }

    await super.delete(id);
    await EventService.emitEvent(EventTypes.NOTIFICATION_DELETED, { id });

    LoggerService.logInfo(`🗑️ Notification deleted: ${id}`);
    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.update(id, { read: true }); // 🔹 Efectuăm update-ul

    const updatedNotification = await this.getById(id); // 🔹 Obținem notificarea actualizată
    if (!updatedNotification) {
        throw new Error(`Notification with ID ${id} not found after marking as read.`);
    }

    LoggerService.logInfo(`✅ Notification marked as read: ${id}`);
    return updatedNotification; // 🔹 Returnăm notificarea actualizată
}

  async getById(id: string): Promise<Notification> {
    return await super.getById(id);
  }

  async update(id: string, notification: Partial<Notification>): Promise<Notification> {
    await super.update(id, notification); // 🔹 Apelăm update din BaseRepository
  
    const updatedNotification = await this.getById(id); // 🔹 Obținem notificarea actualizată
    if (!updatedNotification) {
      throw new Error(`Notification with ID ${id} not found after update.`);
    }
  
    return updatedNotification; // 🔹 Returnăm notificarea actualizată
  }  
}

export default new NotificationRepository();
