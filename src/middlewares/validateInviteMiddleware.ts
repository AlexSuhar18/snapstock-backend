import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import LoggerService from "../services/LoggerService";
import InvitationValidationService from "../services/validation/InvitationValidationService"; // ✅ Folosim validatorul tău

class ValidateInviteMiddleware {
  /**
   * ✅ Validează trimiterea unei invitații
   */
  static validateSendInvite(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    if (!email) {
      LoggerService.logWarn("❌ Email missing in sendInvite request.");
      return next(new BadRequestError("Email is required to send an invitation."));
    }

    if (typeof email !== "string" || !InvitationValidationService.isValidEmail(email)) {
      LoggerService.logWarn(`❌ Invalid email format: ${email}`);
      return next(new BadRequestError("Invalid email format."));
    }

    next();
  }

  /**
   * ✅ Validează acceptarea unei invitații
   */
  static validateAcceptInvite(req: Request, res: Response, next: NextFunction) {
    const { invitation, fullName, password } = req.body;

    if (!invitation || !fullName || !password) {
      LoggerService.logWarn("❌ Missing fields in acceptInvite request.");
      return next(
        new BadRequestError("Invitation, full name, and password are required to accept an invitation.")
      );
    }

    if (!invitation.inviteToken) {
      LoggerService.logWarn("❌ Missing invitation token in request.");
      return next(new BadRequestError("Invitation token is required."));
    }

    if (typeof invitation.expiresAt === "string" && ValidateInviteMiddleware.isExpired(invitation.expiresAt)) {
      LoggerService.logWarn(`❌ Invitation token expired for ${invitation.email}`);
      return next(new BadRequestError("Invitation token has expired."));
    }

    next();
  }

  /**
   * ✅ Verifică dacă token-ul de invitație a expirat
   */
  private static isExpired(expiresAt: string): boolean {
    const now = new Date();
    const expiration = new Date(expiresAt);
    return expiration.getTime() < now.getTime();
  }
}

export default ValidateInviteMiddleware;
