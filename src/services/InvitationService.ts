import InvitationRepository from "../repositories/InvitationRepository";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors";
import { Invitation } from "../models/invitationModel";
import crypto from "crypto";
import invitationQueue from "../queues/InvitationQueueManager";
import bcrypt from "bcrypt";
import { EventTypes } from "../events/EventTypes";

class InvitationService {
  /**
   * ✅ Creează o nouă invitație
   */
  static async createInvitation(data: Partial<Invitation>): Promise<Invitation> {
    if (!data.email || !data.role) {
      throw new BadRequestError("Missing required fields: email, role.");
    }

    let existingInvitation = await InvitationRepository.getByEmail(data.email);
    if (existingInvitation && existingInvitation.status === "pending") {
      LoggerService.logInfo(`🔄 Resending invitation for ${data.email}`);
      return await this.resendInvitation(existingInvitation.email);
    }

    const inviteToken = crypto.randomBytes(16).toString("hex");

    const invitationData: Invitation = {
      id: inviteToken,
      email: data.email,
      role: data.role,
      invitedBy: data.invitedBy ?? "system",
      inviteToken: inviteToken,
      expiresAt: data.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    };

    const invitation = await InvitationRepository.create(invitationData);

    // 🔹 Emit event și adaugă job în queue în paralel
    await Promise.all([
      EventService.emitEvent(EventTypes.INVITATION_CREATED, { inviteId: invitation.inviteToken, email: invitation.email }),
      invitationQueue.addJob("send-invitation", {
        email: invitation.email,
        inviteId: invitation.inviteToken,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      }),
    ]);

    LoggerService.logInfo(`📩 Invitation created for ${invitation.email}`);
    return invitation;
  }

  /**
   * ✅ Obține invitația după token
   */
  static async getByToken(token: string): Promise<Invitation> {
    const invitation = await InvitationRepository.getByToken(token);
    if (!invitation) {
      throw new NotFoundError(`No invitation found for token: ${token}`);
    }
    return invitation;
  }

  /**
   * ✅ Acceptă o invitație
   */
  static async acceptInvite(invitation: Invitation, fullName: string, password: string): Promise<any> {
    if (!password || password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters long.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await InvitationRepository.markAccepted(invitation.inviteToken);

    await EventService.emitEvent(EventTypes.INVITATION_ACCEPTED, { inviteId: invitation.inviteToken, email: invitation.email });
    LoggerService.logInfo(`✅ Invitation accepted for ${invitation.email}`);

    return { email: invitation.email, fullName, hashedPassword };
  }

  /**
   * ✅ Retrimite o invitație
   */
  static async resendInvitation(email: string): Promise<Invitation> {
    const existingInvitation = await InvitationRepository.getByEmail(email);
    if (!existingInvitation || existingInvitation.status !== "pending") {
      throw new NotFoundError(`No pending invitation found for ${email}`);
    }

    let newInviteToken;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    do {
      newInviteToken = crypto.randomBytes(16).toString("hex");
      attempts++;
    } while (await InvitationRepository.tokenExists(newInviteToken) && attempts < MAX_ATTEMPTS);

    if (attempts === MAX_ATTEMPTS) {
      throw new Error("Failed to generate a unique invite token after multiple attempts.");
    }

    await InvitationRepository.update(existingInvitation.inviteToken, { inviteToken: newInviteToken });

    await Promise.all([
      EventService.emitEvent(EventTypes.INVITATION_RESENT, { email, inviteId: newInviteToken }),
      invitationQueue.addJob("send-invitation", {
        email: existingInvitation.email,
        inviteId: newInviteToken,
        role: existingInvitation.role,
        expiresAt: existingInvitation.expiresAt,
      }),
    ]);

    LoggerService.logInfo(`🔄 Invitation resent for ${email}`);
    return existingInvitation;
  }

  /**
   * ✅ Obține toate invitațiile
   */
  static async getAllInvitations(): Promise<Invitation[]> {
    return await InvitationRepository.getAll();
  }

  /**
   * ✅ Expiră invitațiile care au depășit termenul limită
   */
  static async expireInvitations(): Promise<void> {
    const expiredInvitations: Invitation[] = await InvitationRepository.expireInvitations();

    if (!expiredInvitations.length) {
      LoggerService.logInfo("✅ No expired invitations found.");
      return;
    }

    await Promise.all(
      expiredInvitations.map(async (invitation: Invitation) => {
        await EventService.emitEvent(EventTypes.INVITATION_EXPIRED, { 
          inviteId: invitation.inviteToken, 
          email: invitation.email ?? ""
        });
      })
    );

    LoggerService.logInfo(`❌ Expired ${expiredInvitations.length} outdated invitations`);
  }

  /**
   * ✅ Revocă o invitație
   */
  static async revokeInvitation(token: string): Promise<void> {
    const invitation = await InvitationRepository.getByToken(token);
    if (!invitation) {
      throw new NotFoundError(`No invitation found for token: ${token}`);
    }

    await InvitationRepository.markRevoked(token);

    await EventService.emitEvent(EventTypes.INVITATION_REVOKED, { inviteId: token, email: invitation.email });
    LoggerService.logInfo(`🚫 Invitation revoked: ${token}`);
  }
}

export default InvitationService;
