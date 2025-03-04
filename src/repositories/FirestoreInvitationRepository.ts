import { IInvitationRepository } from "../Interfaces/IInvitationRepository";
import { Invitation } from "../models/invitationModel";
import BaseRepository from "./BaseRepository";
import * as crypto from "crypto";

class FirestoreInvitationRepository
  extends BaseRepository<Invitation>
  implements IInvitationRepository
{
  constructor() {
    super("invitations");
  }

  async getByToken(token: string): Promise<Invitation | null> {
    return await this.getByField("inviteToken", token);
  }

  async getByEmail(email: string): Promise<Invitation | null> {
    return await this.getByField("email", email);
  }

  async create(invitation: Invitation): Promise<Invitation> {
    const inviteToken = invitation.inviteToken || crypto.randomBytes(16).toString("hex");
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newInvitation: Invitation = {
      ...invitation,
      inviteToken,
      createdAt,
      expiresAt,
      status: invitation.status ?? "pending",
    };

    return await super.create(newInvitation);
  }

  async update(id: string, invitation: Partial<Invitation>): Promise<Invitation> {
    if (invitation.status && !["pending", "accepted", "expired", "revoked"].includes(invitation.status)) {
      throw new Error(`Invalid status value: ${invitation.status}`);
    }

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

    return await this.update(token, {
      status: "accepted",
      acceptedAt: new Date().toISOString(),
    });
  }

  async markRevoked(token: string): Promise<Invitation> {
    const invitation = await this.getByToken(token);
    if (!invitation) {
      throw new Error(`Invitation with token ${token} not found.`);
    }

    return await this.update(token, {
      status: "revoked",
      revokedAt: new Date().toISOString(),
    });
  }

  async sendReminder(token: string): Promise<Invitation> {
    const invitation = await this.getByToken(token);
    if (!invitation) {
      throw new Error(`Invitation with token ${token} not found.`);
    }

    if (invitation.reminderSent) {
      return invitation;
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

    for (const invitation of expiredInvitations) {
      await this.update(invitation.inviteToken, { status: "expired" });
    }

    return expiredInvitations;
  }
}

export default new FirestoreInvitationRepository();
