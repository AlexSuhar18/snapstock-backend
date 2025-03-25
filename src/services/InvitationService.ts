import InvitationRepository from "../repositories/FirestoreInvitationRepository"; // Import corect
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors";
import { Invitation } from "../models/invitationModel";
import crypto from "crypto";
import invitationQueue from "../queues/InvitationQueueManager";
import bcrypt from "bcrypt";
import { EventTypes } from "../events/EventTypes";
import InvitationValidationService from "../services/validation/InvitationValidationService";

class InvitationService {
  /**
   * ✅ Creează o invitație nouă, cu validare suplimentară
   */
  static async createInvitation(data: Partial<Invitation>): Promise<Invitation> {
    if (!data.email || !data.role) {
      throw new BadRequestError("Missing required fields: email, role.");
    }
    
    // 🔍 Validare format email
    if (!InvitationValidationService.isValidEmail(data.email)) {
      throw new BadRequestError(`Invalid email format: ${data.email}`);
    }
    
    let existingInvitation = await InvitationRepository.getByEmail(data.email);
    if (existingInvitation && existingInvitation.status === "pending") {
      LoggerService.logInfo(`🔄 Resending invitation for ${data.email}`);
      return await this.resendInvitation(existingInvitation.email);
    }

    const inviteToken = await this.generateUniqueToken();
    const invitationData: Invitation = {
      id: inviteToken,
      email: data.email,
      role: data.role,
      invitedBy: data.invitedBy ?? "system",
      inviteToken,
      expiresAt: data.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    };

    const invitation = await InvitationRepository.create(invitationData);
    await Promise.all([
      EventService.emitEvent(EventTypes.INVITATION_CREATED, { inviteId: invitation.inviteToken, email: invitation.email }).catch(error =>
        LoggerService.logError("❌ Error emitting INVITATION_CREATED event", error)
      ),
      invitationQueue.addJob("send-invitation", invitation),
    ]);

    LoggerService.logInfo(`📩 Invitation created for ${invitation.email}`);
    return invitation;
  }

  static async getByToken(token: string): Promise<Invitation> {
    const invitation = await InvitationRepository.getByToken(token);
    if (!invitation) {
      throw new NotFoundError(`No invitation found for token: ${token}`);
    }
    return invitation;
  }

  static async getByEmail(email: string): Promise<Invitation | null> {
    try {
      if (!InvitationValidationService.isValidEmail(email)) {
        throw new BadRequestError(`Invalid email format: ${email}`);
      }

      LoggerService.logInfo(`🔍 Fetching invitation by email: ${email}`);
      const invitation = await InvitationRepository.getByEmail(email);

      if (!invitation) {
        LoggerService.logWarn(`⚠️ No invitation found for email: ${email}`);
        return null;
      }

      LoggerService.logInfo(`✅ Invitation found for email: ${email}`);
      return invitation;
    } catch (error) {
      LoggerService.logError(`❌ Error fetching invitation for email: ${email}`, error);
      throw error;
    }
  }

  static async acceptInvite(invitation: Invitation, fullName: string, password: string): Promise<{ email: string; fullName: string; hashedPassword: string }> {
    try {
      if (!invitation) {
        throw new NotFoundError("❌ Invitation not found");
      }
      
      InvitationValidationService.validateAcceptInvite(fullName, password);
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedInvitation = await InvitationRepository.markAccepted(invitation.inviteToken);
      
      await EventService.emitEvent(EventTypes.INVITATION_ACCEPTED, { inviteId: updatedInvitation.inviteToken, email: updatedInvitation.email }).catch(error =>
        LoggerService.logError("❌ Error emitting INVITATION_ACCEPTED event", error)
      );
      
      LoggerService.logInfo(`✅ Invitation accepted for ${updatedInvitation.email}`);
      return { email: updatedInvitation.email, fullName, hashedPassword };
    } catch (error) {
      LoggerService.logError("❌ Error accepting invitation", error);
      throw error;
    }
  }
  
  private static async generateUniqueToken(): Promise<string> {
    let newInviteToken;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    do {
      newInviteToken = crypto.randomBytes(16).toString("hex");
      attempts++;
    } while (await InvitationRepository.getByToken(newInviteToken) && attempts < MAX_ATTEMPTS);

    if (attempts === MAX_ATTEMPTS) {
      throw new Error("Failed to generate a unique invite token after multiple attempts.");
    }

    return newInviteToken;
  }

    /**
   * ✅ Retrimite o invitație existentă
   */
    static async resendInvitation(email: string): Promise<Invitation> {
      try {
        if (!InvitationValidationService.isValidEmail(email)) {
          throw new BadRequestError(`Invalid email format: ${email}`);
        }
  
        const existingInvitation = await InvitationRepository.getByEmail(email);
        if (!existingInvitation || existingInvitation.status !== "pending") {
          throw new NotFoundError(`No pending invitation found for ${email}`);
        }
  
        const newInviteToken = await this.generateUniqueToken();
        const updatedInvitation = await InvitationRepository.update(existingInvitation.inviteToken, { inviteToken: newInviteToken });
  
        await Promise.all([
          EventService.emitEvent(EventTypes.INVITATION_RESENT, { email, inviteId: newInviteToken }).catch(error =>
            LoggerService.logError("❌ Error emitting INVITATION_RESENT event", error)
          ),
          invitationQueue.addJob("send-invitation", {
            email: updatedInvitation.email,
            inviteId: newInviteToken,
            role: updatedInvitation.role,
            expiresAt: updatedInvitation.expiresAt,
          }),
        ]);
  
        LoggerService.logInfo(`🔄 Invitation resent for ${email}`);
        return updatedInvitation;
      } catch (error) {
        LoggerService.logError("❌ Error resending invitation", error);
        throw error;
      }
    }  
}

export default InvitationService;
