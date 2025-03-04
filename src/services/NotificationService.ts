import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import LoggerService from "../services/LoggerService";

class NotificationService {
  /**
   * ✅ Trimite o invitație și emite un eveniment
   */
  static async sendInvitation(data: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!data.email || !data.inviteId) {
        return { success: false, message: "Missing required parameters: email or inviteId" };
      }

      // 🔹 Construim obiectul invitației
      const invitation = {
        email: data.email,
        inviteId: data.inviteId,
        inviteMethod: data.inviteMethod || "email",
        phoneNumber: data.phoneNumber || "",
        role: data.role || "guest",
        invitedBy: data.invitedBy || "system",
        status: data.status || "pending",
        createdAt: new Date().toISOString(),
      };

      // 🔥 Emitere eveniment în mod securizat
      await EventService.emitEvent(EventTypes.INVITATION_CREATED, { email: invitation.email, inviteId: invitation.inviteId })
        .catch(error => LoggerService.logError("❌ Error emitting invitation event", error));

      return { success: true, message: "Invitation processed successfully", data: invitation };
    } catch (error) {
      LoggerService.logError("❌ Error processing invitation", error);
      return { success: false, message: "Error processing invitation" };
    }
  }

  /**
   * ✅ Trimite o notificare administratorului
   */
  static async notifyAdmin(data: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!data.email || !data.invitedBy || !data.message) {
        return { success: false, message: "Missing required parameters: email, invitedBy, or message" };
      }

      // 🔹 Construim obiectul notificării
      const notification = {
        email: data.email,
        invitedBy: data.invitedBy,
        message: data.message,
        priority: data.priority || "normal",
      };

      // 🔥 Emitere eveniment în mod securizat
      await EventService.emitEvent(EventTypes.ADMIN_NOTIFICATION, { message: notification.message, priority: notification.priority })
        .catch(error => LoggerService.logError("❌ Error emitting admin notification event", error));

      return { success: true, message: "Admin notification sent successfully", data: notification };
    } catch (error) {
      LoggerService.logError("❌ Error sending admin notification", error);
      return { success: false, message: "Error sending admin notification" };
    }
  }

  /**
   * ✅ Trimite un reminder prin email
   */
  static async sendReminderEmail(data: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!data.email || !data.inviteId) {
        return { success: false, message: "Missing required parameters: email or inviteId" };
      }

      // 🔹 Construim detaliile reminder-ului
      const reminder = {
        email: data.email,
        inviteId: data.inviteId,
      };

      // 🔥 Emitere eveniment în mod securizat
      await EventService.emitEvent(EventTypes.INVITATION_REMINDER_SENT, { email: reminder.email, inviteId: reminder.inviteId })
        .catch(error => LoggerService.logError("❌ Error emitting reminder email event", error));

      return { success: true, message: "Reminder email sent successfully", data: reminder };
    } catch (error) {
      LoggerService.logError("❌ Error sending reminder email", error);
      return { success: false, message: "Error sending reminder email" };
    }
  }
}

export default NotificationService;
