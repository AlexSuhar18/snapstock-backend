import { Notification } from '../../models/notification';

export interface INotificationRepository {
  getById(id: string): Promise<Notification | null>;
  getAll(): Promise<Notification[]>;
  create(notification: Notification): Promise<Notification>;
  update(id: string, notification: Partial<Notification>): Promise<void>;
  delete(id: string): Promise<void>;
  getByUserId(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
}
