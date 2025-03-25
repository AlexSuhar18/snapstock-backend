import { IInvitationRepository } from "../Interfaces/IInvitationRepository";
import { Invitation } from "../models/invitationModel";
import BaseRepository from "./BaseRepository";
import * as crypto from "crypto";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import LoggerService from "../services/LoggerService";

class FirestoreInvitationRepository
  extends BaseRepository<Invitation>
  implements IInvitationRepository
{
  constructor() {
    super("invitations");
  }

  async getByToken(token: string): Promise<Invitation> {
    const invitation = await this.getByField("inviteToken", token);
    if (!invitation) {
      throw new Error(`Invitation with token ${token} not found.`);
    }
    return invitation;
  }

  async getByEmail(email: string): Promise<Invitation | null> {
    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new Error("Invalid email address.");
    }
    const result = await this.getByField("email", email);
    return result && result.status === "pending" ? result : null;
  }

  async create(invitation: Invitation): Promise<Invitation> {
    const inviteToken = invitation.inviteToken || crypto.randomBytes(16).toString("hex");
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newInvitation = { ...invitation, inviteToken, createdAt, expiresAt };
    return await super.create(newInvitation);
  }

  async update(id: string, invitation: Partial<Invitation>): Promise<Invitation> {
    return await super.update(id, invitation);
  }

  async delete(id: string): Promise<Invitation> {
    const invitation = await this.getById(id);
    if (!invitation) {
      throw new Error(`Invitation with ID ${id} not found.`);
    }
    await super.delete(id);
    return invitation;
  }

  async markAccepted(token: string): Promise<Invitation> {
    const invitation = await this.getByToken(token);
    if (!invitation) {
      throw new Error(`Invitation with token ${token} not found.`);
    }

    const updatedInvitation = await this.update(token, {
      status: "accepted",
      acceptedAt: new Date().toISOString(),
    });

    try {
      await EventService.emitEvent(EventTypes.INVITATION_ACCEPTED, { email: invitation.email, inviteId: invitation.id  });
    } catch (error) {
      LoggerService.logError(`❌ Failed to emit INVITATION_ACCEPTED event: ${error}`);
    }

    return updatedInvitation;
  }

  async markRevoked(token: string): Promise<Invitation> {
    return await this.update(token, {
      status: "revoked",
      revokedAt: new Date().toISOString(),
    });
  }

  async sendReminder(token: string): Promise<Invitation> {
    const invitation = await this.getByToken(token);
    if (invitation.reminderSent) {
      throw new Error(`Reminder already sent for invitation with token ${token}`);
    }

    return await this.update(token, {
      reminderSent: true,
      reminderSentAt: new Date().toISOString(),
    });
  }

  async expireInvitations(): Promise<Invitation[]> {
    const allInvitations = await this.getAll();
    const expiredInvitations = allInvitations.filter(
      (inv) => inv.expiresAt && new Date(inv.expiresAt) <= new Date() && inv.status === "pending"
    );

    const updatedInvitations: Invitation[] = [];
    for (const invitation of expiredInvitations) {
      const updatedInvitation = await this.update(invitation.inviteToken, { status: "expired" });
      updatedInvitations.push(updatedInvitation);
    }

    return updatedInvitations;
  }
}

export default FirestoreInvitationRepository;
