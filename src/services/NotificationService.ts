import { sendInvitationEmail, sendInvitationSMS } from "../utils/notificationUtils";
import { Invitation } from "../models/invitation";
import { NotificationRepository } from "../repositories/NotificationRepository";
import EmailService from "./EmailService";
import SMSService from "./SMSService";
import LoggerService from "../services/LoggerService";
import EventBus from "../events/EventBus";
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: "SENTRY_DSN" });

export class NotificationService {
    /**
     * ✅ Trimite invitația prin email și/sau SMS, cu retry logic
     */
    static async sendInvitation(invitation: Invitation, retries = 3): Promise<void> {
        try {
            if (!invitation.email || !invitation.inviteToken) {
                throw new Error("Invalid invitation: Missing email or token.");
            }

            LoggerService.logInfo(`📨 Preparing to send invitation to ${invitation.email}`);

            const notificationJobs: Promise<string>[] = [];

            // ✅ Trimite prin email, dacă metoda include email
            if (invitation.inviteMethod === "email" || invitation.inviteMethod === "both") {
                notificationJobs.push(
                    EmailService.sendEmail(
                        invitation.email ?? "",
                        "You have been invited!",
                        `Click the link to accept your invitation: ${process.env.FRONTEND_URL}/accept-invite/${invitation.inviteToken}`
                    )
                );
            }

            // ✅ Trimite prin SMS, dacă metoda include SMS
            if ((invitation.inviteMethod === "sms" || invitation.inviteMethod === "both") && invitation.phoneNumber) {
                notificationJobs.push(
                    SMSService.sendSMS(
                        invitation.phoneNumber ?? "",
                        `You have been invited! Click the link to accept: ${process.env.FRONTEND_URL}/accept-invite/${invitation.inviteToken}`
                    )
                );
            }

            // 🔹 Așteptăm ca toate job-urile să fie procesate asincron
            const results = await Promise.allSettled(notificationJobs);

            results.forEach((result, index) => {
                if (result.status === "fulfilled") {
                    LoggerService.logInfo(`✅ Notification sent successfully: ${result.value}`);
                } else {
                    LoggerService.logError("❌ Failed to send notification:", result.reason);
                }
            });

            LoggerService.logInfo(`📨 Notification process completed for ${invitation.email}`);

            // 🔹 Emit event că invitația a fost trimisă
            EventBus.emit("notification:sent", { email: invitation.email, inviteToken: invitation.inviteToken });
        } catch (error) {
            Sentry.captureException(error);
            LoggerService.logError("❌ Error sending invitation notification:", error);
            throw new Error("Error sending invitation notification");
        }
    }

    /**
     * ✅ Notifică un admin când o invitație este acceptată.
     */
    static async notifyAdmin(invitation: Invitation): Promise<void> {
        try {
            await NotificationRepository.addNotification(
                invitation.invitedBy,
                `User ${invitation.email} has accepted the invitation.`,
                "invitation_accepted"
            );

            LoggerService.logInfo(`🔔 Admin notified about accepted invitation: ${invitation.email}`);

            // 🔹 Emit event că invitația a fost acceptată
            EventBus.emit("invitation:accepted", { email: invitation.email });
        } catch (error) {
            LoggerService.logError("❌ Error notifying admin:", error);
            Sentry.captureException(error);
        }
    }

    /**
     * ✅ Trimite un email de reminder cu 3 ore înainte de expirarea invitației.
     */
    static async sendReminderEmail(email: string, inviteToken: string): Promise<void> {
        try {
            LoggerService.logInfo(`📩 Sending reminder email to ${email}`);

            const emailSent = await EmailService.sendEmail(
                email,
                "Reminder: Your invitation is expiring soon!",
                `Hello, your invitation is about to expire in 3 hours. Click the link below to accept it before it expires:
                
                ${process.env.FRONTEND_URL}/invite?token=${inviteToken}`,
                `
                <h3>Reminder: Your Invitation is Expiring Soon!</h3>
                <p>Hello,</p>
                <p>Your invitation is about to expire in <strong>3 hours</strong>. Click the button below to accept it before it expires:</p>
                <p><a href="${process.env.FRONTEND_URL}/invite?token=${inviteToken}" 
                style="padding: 10px 20px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
                Accept Invitation</a></p>
                <p>If you have any questions, feel free to contact us.</p>
                <p>Thank you!</p>
                `
            );

            if (emailSent) {
                LoggerService.logInfo(`✅ Reminder email sent to ${email}`);
            } else {
                LoggerService.logWarn(`⚠️ Reminder email failed to send to ${email}`);
            }
        } catch (error) {
            LoggerService.logError(`🚨 Error sending reminder email to ${email}:`, error);
            Sentry.captureException(error);
        }
    }
}

export default NotificationService;