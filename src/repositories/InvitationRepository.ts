import PersistenceService from "../services/PersistenceService";
import { Invitation } from "../models/invitationModel";
import BaseRepository from "./BaseRepository";
import { IInvitationRepository } from "./Interfaces/IInvitationRepository";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

const INVITATION_COLLECTION = "invitations";

class InvitationRepository extends BaseRepository<Invitation> implements IInvitationRepository {
  constructor() {
    super(INVITATION_COLLECTION);
  }

  async getByToken(token: string): Promise<Invitation | null> {
    try {
      const document = await this.db.getSingleDocumentByField(this.collectionName, "inviteToken", token);
      return document ? new Invitation({ id: document.id, ...document }) : null;
    } catch (error) {
      LoggerService.logError("❌ Error fetching invitation by token", error);
      throw new Error("Error fetching invitation by token");
    }
  }

  async getByEmail(email: string): Promise<Invitation | null> {
    try {
      const document = await this.db.getSingleDocumentByField(this.collectionName, "email", email);
      return document ? new Invitation({ id: document.id, ...document }) : null;
    } catch (error) {
      LoggerService.logError("❌ Error fetching invitation by email", error);
      throw new Error("Error fetching invitation by email");
    }
  }

  async create(invitation: Partial<Invitation>): Promise<Invitation> {
    try {
      if (!invitation.email || !invitation.role || !invitation.invitedBy) {
        throw new Error("Missing required fields: email, role, invitedBy.");
      }

      const id = this.db.generateId(this.collectionName);
      const newInvitation: Invitation = {
        id,
        email: invitation.email,
        role: invitation.role,
        inviteToken: invitation.inviteToken ?? "",
        expiresAt: invitation.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: invitation.status ?? "pending",
        invitedBy: invitation.invitedBy, // ✅ Adăugat `invitedBy`
      };

      await this.db.createDocument(this.collectionName, id, newInvitation);

      LoggerService.logInfo(`📩 Invitation created: ${newInvitation.email}`);
      await EventService.emitEvent(EventTypes.INVITATION_CREATED, {
        email: newInvitation.email ?? "",
        inviteId: id,
      });

      return newInvitation;
    } catch (error) {
      LoggerService.logError("❌ Error creating invitation", error);
      throw new Error("Error creating invitation");
    }
  }

  async update(id: string, invitation: Partial<Invitation>): Promise<void> {
    try {
      await this.db.updateDocument(this.collectionName, id, invitation);

      LoggerService.logInfo(`🔄 Invitation updated: ${id}`);
      await EventService.emitEvent(EventTypes.INVITATION_UPDATED, {
        inviteId: id,
        email: invitation.email ?? "",
      });
    } catch (error) {
      LoggerService.logError("❌ Error updating invitation", error);
      throw new Error("Error updating invitation");
    }
  }

  async updateInvitation(token: string, updatedFields: Partial<Invitation>): Promise<void> {
    const invitation = await this.getByToken(token);
    if (!invitation) throw new Error("Invitation not found");

    await this.update(invitation.id, updatedFields);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.deleteDocument(this.collectionName, id);

      LoggerService.logInfo(`🗑️ Invitation deleted: ${id}`);
      await EventService.emitEvent(EventTypes.INVITATION_DELETED, {
        inviteId: id,
      });
    } catch (error) {
      LoggerService.logError("❌ Error deleting invitation", error);
      throw new Error("Error deleting invitation");
    }
  }

  async expireInvitations(): Promise<Invitation[]> {
    try {
      const expiredInvitations = await this.db.getDocumentsByFieldCondition(
        this.collectionName,
        "expiresAt",
        "<=",
        new Date().toISOString()
      );

      if (!expiredInvitations.length) return [];

      for (const invitation of expiredInvitations) {
        await this.db.updateDocument(this.collectionName, invitation.id!, {
          status: "expired",
        });

        LoggerService.logInfo(`❌ Invitation expired: ${invitation.id}`);

        // ✅ Acum include `email`
        await EventService.emitEvent(EventTypes.INVITATION_EXPIRED, {
          inviteId: invitation.id!,
          email: invitation.email ?? "", // Asigură-te că `email` este definit
        });
      }

      return expiredInvitations.map(inv => new Invitation(inv)); // ✅ Returnează array de invitații expirate
    } catch (error) {
      LoggerService.logError("❌ Error expiring invitations", error);
      throw new Error("Error expiring invitations");
    }
}

  async expireAllInvitations(): Promise<Invitation[]> {
    try {
      const expiredInvitations = await this.db.getDocumentsByFieldCondition(
        this.collectionName,
        "expiresAt",
        "<=",
        new Date().toISOString()
      );

      if (!expiredInvitations.length) return []; // ✅ Returnează un array gol în loc de `void`

      for (const invitation of expiredInvitations) {
        await this.db.updateDocument(this.collectionName, invitation.id!, {
          status: "expired",
        });

        LoggerService.logInfo(`❌ Invitation expired: ${invitation.id}`);
      }

      return expiredInvitations.map(inv => new Invitation(inv)); // ✅ Returnează un array de obiecte Invitation
    } catch (error) {
      LoggerService.logError("❌ Error expiring invitations", error);
      throw new Error("Error expiring invitations");
    }
}

  async markAccepted(token: string): Promise<void> {
    const invitation = await this.getByToken(token);
    if (!invitation) throw new Error("Invitation not found");

    await this.db.updateDocument(this.collectionName, invitation.id!, {
      status: "accepted",
      acceptedAt: new Date().toISOString(),
    });

    LoggerService.logInfo(`✅ Invitation marked as accepted: ${token}`);
    await EventService.emitEvent(EventTypes.INVITATION_ACCEPTED, {
      inviteId: invitation.id!,
      email: invitation.email ?? "",
    });
  }

  async markRevoked(token: string): Promise<void> {
    const invitation = await this.getByToken(token);
    if (!invitation) throw new Error("Invitation not found");

    await this.db.updateDocument(this.collectionName, invitation.id!, {
      status: "revoked",
      revokedAt: new Date().toISOString(),
    });

    LoggerService.logInfo(`🚫 Invitation marked as revoked: ${token}`);
    await EventService.emitEvent(EventTypes.INVITATION_REVOKED, {
      inviteId: invitation.id!,
      email: invitation.email ?? "",
    });
  }

  async tokenExists(token: string): Promise<boolean> {
    const existingToken = await this.getByToken(token);
    return existingToken !== null;
  }

  async sendReminder(token: string): Promise<void> {
    const invitation = await this.getByToken(token);
    if (!invitation) throw new Error("Invitation not found");

    await this.db.updateDocument(this.collectionName, invitation.id!, {
      reminderSent: true,
      reminderSentAt: new Date().toISOString(),
    });

    LoggerService.logInfo(`📩 Reminder sent for invitation: ${token}`);
    await EventService.emitEvent(EventTypes.INVITATION_REMINDER_SENT, {
      inviteId: invitation.id!,
      email: invitation.email ?? "",
    });
  }
}

export default new InvitationRepository();
