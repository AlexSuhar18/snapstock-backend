import NotificationRepository from "../repositories/NotificationRepository";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import EmailService from "./EmailService";
import SMSService from "./SMSService";
import { Invitation } from "../models/invitationModel";
import * as Sentry from "@sentry/node";
import { EventTypes } from "../events/EventTypes";
import { NotificationType } from "../enums/NotificationType";

Sentry.init({ dsn: "SENTRY_DSN" });

class NotificationService {
  /**
   * ✅ Trimite o invitație prin email și/sau SMS
   */
  static async sendInvitation(invitation: Invitation): Promise<void> {
    try {
      if (!invitation.email || !invitation.inviteToken) {
        throw new Error("Invalid invitation: Missing email or token.");
      }

      LoggerService.logInfo(`📨 Preparing to send invitation to ${invitation.email}`);

      const notificationJobs: Promise<string | void>[] = [];

      if (invitation.inviteMethod === "email" || invitation.inviteMethod === "both") {
        notificationJobs.push(
          EmailService.sendEmail(
            invitation.email,
            "You have been invited!",
            `Click the link to accept your invitation: ${process.env.FRONTEND_URL}/accept-invite/${invitation.inviteToken}`
          ).then(() => "Email sent")
        );
      }

      if ((invitation.inviteMethod === "sms" || invitation.inviteMethod === "both") && invitation.phoneNumber) {
        notificationJobs.push(
          SMSService.sendSMS(
            invitation.phoneNumber,
            `You have been invited! Click the link to accept: ${process.env.FRONTEND_URL}/accept-invite/${invitation.inviteToken}`
          ).then(() => "SMS sent")
        );
      }

      const results = await Promise.allSettled(notificationJobs);

      for (const result of results) {
        if (result.status === "fulfilled") {
          LoggerService.logInfo(`✅ Notification sent successfully: ${result.value}`);
        } else {
          const errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
          LoggerService.logError("❌ Failed to send notification:", errorMessage);
        }
      }

      LoggerService.logInfo(`📨 Notification process completed for ${invitation.email}`);
      await EventService.emitEvent(EventTypes.INVITATION_CREATED, {
        email: invitation.email,
        inviteId: invitation.inviteToken,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      LoggerService.logError("❌ Error sending invitation notification:", errorMessage);
      await EventService.emitEvent(EventTypes.NOTIFICATION_FAILED, { email: invitation.email, error: errorMessage });
    }
  }

  /**
   * ✅ Notifică un administrator când o invitație este acceptată
   */
  static async notifyAdmin(invitation: Invitation): Promise<void> {
    try {
      if (!NotificationRepository.addNotification) {
        throw new Error("Method addNotification is missing from NotificationRepository");
      }

      await NotificationRepository.addNotification(
        invitation.invitedBy,
        `User ${invitation.email} has accepted the invitation.`,
        NotificationType.EMAIL
      );

      LoggerService.logInfo(`🔔 Admin notified about accepted invitation: ${invitation.email}`);
      await EventService.emitEvent(EventTypes.INVITATION_ACCEPTED, {
        email: invitation.email,
        inviteId: invitation.inviteToken,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      LoggerService.logError("❌ Error notifying admin about accepted invitation:", errorMessage);
      await EventService.emitEvent(EventTypes.NOTIFICATION_ADMIN_FAILED, { email: invitation.email, error: errorMessage });
    }
  }

  /**
   * ✅ Trimite un email de reminder pentru invitațiile care expiră
   */
  static async sendReminderEmail(email: string, inviteToken: string): Promise<void> {
    try {
      LoggerService.logInfo(`📩 Sending reminder email to ${email}`);

      const emailSent = await EmailService.sendEmail(
        email,
        "Reminder: Your invitation is expiring soon!",
        `Hello, your invitation is about to expire in 3 hours. Click the link below to accept it before it expires:
        ${process.env.FRONTEND_URL}/invite?token=${inviteToken}`,
        `<h3>Reminder: Your Invitation is Expiring Soon!</h3>
        <p>Hello,</p>
        <p>Your invitation is about to expire in <strong>3 hours</strong>. Click the button below to accept it before it expires:</p>
        <p><a href="${process.env.FRONTEND_URL}/invite?token=${inviteToken}" 
        style="padding: 10px 20px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
        Accept Invitation</a></p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Thank you!</p>`
      ).then(() => "Email sent");

      if (emailSent) {
        LoggerService.logInfo(`✅ Reminder email sent to ${email}`);
        await EventService.emitEvent(EventTypes.INVITATION_REMINDER_SENT, { email, inviteId: inviteToken });
      } else {
        LoggerService.logWarn(`⚠️ Reminder email failed to send to ${email}`);
        await EventService.emitEvent(EventTypes.NOTIFICATION_FAILED, { email: email, error: "Failed to send reminder" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      LoggerService.logError("❌ Error sending reminder email:", errorMessage);
      await EventService.emitEvent(EventTypes.NOTIFICATION_FAILED, { email: email, error: errorMessage });
    }
  }
}

export default NotificationService;
