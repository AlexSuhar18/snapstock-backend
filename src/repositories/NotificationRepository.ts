import { adminDb } from "../config/firebase";
import admin from "firebase-admin";

export class NotificationRepository {
    static async addNotification(recipientId: string, message: string, type: string): Promise<void> {
        const notification = {
            recipientId,
            message,
            type,
            createdAt: admin.firestore.Timestamp.now(),
            read: false
        };

        await adminDb.collection("notifications").add(notification);
        console.log(`📩 Notification added for recipient: ${recipientId}`);
    }
}
