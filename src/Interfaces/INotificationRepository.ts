import { Notification } from "../models/notification";

export interface INotificationRepository {
  addNotification(userId: string, message: string, type: "email" | "sms" | "push"): Promise<Notification>;
  getByUserId(userId: string): Promise<Notification[]>;
  getById(id: string): Promise<Notification>;
  delete(id: string): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
  update(id: string, notification: Partial<Notification>): Promise<Notification>;
}
