import { Request, Response, NextFunction } from 'express';
import InvitationService from '../services/InvitationService';
import LoggerService from '../services/LoggerService';
import EventService from '../services/EventService';
import { EventTypes } from '../events/EventTypes';
import { BadRequestError, NotFoundError } from '../errors/CustomErrors';

class InviteController {
  /**
   * ✅ Trimite o invitație nouă
   */
  static async sendInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const newInvitation = await InvitationService.createInvitation(req.body);

      // 🔥 Emitere eveniment
      await EventService.emitEvent(EventTypes.INVITATION_CREATED, {
        email: newInvitation.email,
        inviteId: newInvitation.id, // ✅ CORECTAT
      });

      LoggerService.logInfo(`📩 Invitation sent to: ${newInvitation.email}`);
      res.status(201).json(newInvitation);
    } catch (error) {
      LoggerService.logError('❌ Error sending invitation', error);
      next(error);
    }
  }

  /**
   * ✅ Verifică o invitație după token
   */
  static async verifyInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const invitation = await InvitationService.getByToken(req.params.token);
      if (!invitation) {
        throw new NotFoundError('Invalid or expired invitation');
      }
      res.status(200).json(invitation);
    } catch (error) {
      LoggerService.logError('❌ Error verifying invitation', error);
      next(error);
    }
  }

  /**
   * ✅ Acceptă o invitație
   */
  static async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const acceptedInvitation = await InvitationService.acceptInvite(
        req.body.invitation,
        req.body.fullName,
        req.body.password
      );

      // 🔥 Emitere eveniment
      await EventService.emitEvent(EventTypes.INVITATION_ACCEPTED, {
        email: acceptedInvitation.email,
        inviteId: acceptedInvitation.id, // ✅ CORECTAT
      });

      LoggerService.logInfo(`✅ Invitation accepted: ${acceptedInvitation.email}`);
      res.status(200).json(acceptedInvitation);
    } catch (error) {
      LoggerService.logError('❌ Error accepting invitation', error);
      next(error);
    }
  }

  /**
   * ✅ Resetează și retrimite o invitație
   */
  static async resendInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const resentInvitation = await InvitationService.resendInvitation(req.params.email);

      if (!resentInvitation) {
        throw new NotFoundError(`No pending invitation found for email: ${req.params.email}`);
      }

      // 🔥 Emitere eveniment
      await EventService.emitEvent(EventTypes.INVITATION_REMINDER_SENT, {
        email: resentInvitation.email,
        inviteId: resentInvitation.id, // ✅ CORECTAT
      });

      LoggerService.logInfo(`🔄 Invitation resent: ${resentInvitation.email}`);
      res.status(200).json(resentInvitation);
    } catch (error) {
      LoggerService.logError('❌ Error resending invitation', error);
      next(error);
    }
  }

  /**
   * ✅ Revocă o invitație
   */
  static async cancelInvite(req: Request, res: Response, next: NextFunction) {
    try {
      await InvitationService.revokeInvitation(req.params.token);

      // 🔥 Emitere eveniment
      await EventService.emitEvent(EventTypes.INVITATION_REVOKED, {
        inviteId: req.params.token,
        email: "Unknown",
      });

      LoggerService.logInfo(`🚫 Invitation revoked: ${req.params.token}`);
      res.status(200).json({ message: 'Invitation revoked successfully' });
    } catch (error) {
      LoggerService.logError('❌ Error canceling invitation', error);
      next(error);
    }
  }

  /**
   * ✅ Obține toate invitațiile
   */
  static async getAllInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const invitations = await InvitationService.getAllInvitations();
      res.status(200).json(invitations);
    } catch (error) {
      LoggerService.logError('❌ Error fetching invitations', error);
      next(error);
    }
  }

  /**
   * ✅ Expiră automat invitațiile vechi
   */
  static async expireInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      await InvitationService.expireInvitations();

      // 🔥 Emitere eveniment
      await EventService.emitEvent(EventTypes.INVITATION_EXPIRED, {
        inviteId: "Multiple Expired",
      });

      LoggerService.logInfo('⏳ Expired invitations processed');
      res.status(200).json({ message: 'Expired invitations processed' });
    } catch (error) {
      LoggerService.logError('❌ Error expiring invitations', error);
      next(error);
    }
  }
}

export default InviteController;
