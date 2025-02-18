import { Request, Response, NextFunction } from "express";
import NotificationService from "../services/NotificationService";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import { BadRequestError } from "../errors/CustomErrors";
import { Invitation } from "../models/invitationModel";

class NotificationController {
  /**
   * ✅ Trimite o invitație
   */
  static async sendInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      // ✅ Extragem toate câmpurile din request
      const { email, inviteId, inviteMethod, phoneNumber, role, invitedBy, status } = req.body;

      if (!email || !inviteId) {
        throw new BadRequestError("Missing required parameters: email or inviteId");
      }

      // ✅ Construim obiectul `Invitation` cu toate câmpurile necesare
      const invitation: Invitation = {
        id: inviteId, // 🔹 Folosim inviteId ca id-ul invitației
        email,
        inviteToken: inviteId, // 🔹 Mapează inviteId către inviteToken
        inviteMethod: inviteMethod || "email",
        phoneNumber: phoneNumber || "",
        role: role || "guest", // ✅ Adăugat role
        invitedBy: invitedBy || "system", // ✅ Adăugat invitedBy
        status: status || "pending", // ✅ Adăugat status
        createdAt: new Date().toISOString(),
      };

      await NotificationService.sendInvitation(invitation);

      // 🔥 Emiterea evenimentului
      await EventService.emitEvent(EventTypes.INVITATION_CREATED, { email, inviteId });

      LoggerService.logInfo(`📩 Invitation sent successfully to ${email}`);
      res.status(200).json({ message: `Invitation sent to ${email}` });
    } catch (error) {
      LoggerService.logError("❌ Error sending invitation", error);
      next(error);
    }
  }

  /**
   * ✅ Trimite o notificare administratorului
   */
  static async notifyAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, invitedBy, message, priority } = req.body;
  
      if (!email || !invitedBy || !message) {
        throw new BadRequestError("Missing required parameters: email, invitedBy, or message");
      }
  
      // ✅ Construim un obiect Invitation valid
      const invitation: Invitation = {
        id: "", // Nu avem un ID în acest context, dar trebuie definit
        email,
        inviteToken: "", // Nu este necesar un token aici, dar trebuie să existe
        inviteMethod: "email",
        phoneNumber: "",
        role: "admin",
        invitedBy,
        status: "accepted",
        createdAt: new Date().toISOString(),
      };
  
      await NotificationService.notifyAdmin(invitation);
  
      // 🔥 Emiterea evenimentului
      await EventService.emitEvent(EventTypes.ADMIN_NOTIFICATION, { message, priority: priority || "normal" });
  
      LoggerService.logInfo(`📢 Admin notification sent: ${message}`);
      res.status(200).json({ message: "Admin notification sent successfully" });
    } catch (error) {
      LoggerService.logError("❌ Error notifying admin", error);
      next(error);
    }
  }  

  /**
   * ✅ Trimite un reminder prin email
   */
  static async sendReminderEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, inviteId } = req.body;

      if (!email || !inviteId) {
        throw new BadRequestError("Missing required parameters: email or inviteId");
      }

      await NotificationService.sendReminderEmail(email, inviteId);

      // 🔥 Emiterea evenimentului
      await EventService.emitEvent(EventTypes.INVITATION_REMINDER_SENT, { email, inviteId });

      LoggerService.logInfo(`🔔 Reminder email sent successfully to ${email}`);
      res.status(200).json({ message: `Reminder email sent to ${email}` });
    } catch (error) {
      LoggerService.logError("❌ Error sending reminder email", error);
      next(error);
    }
  }
}

export default NotificationController;
