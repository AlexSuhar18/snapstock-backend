import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";

class ValidateInviteMiddleware {
  static validateSendInvite(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    if (!email) {
      return next(new BadRequestError("Email is required to send an invitation."));
    }
    next();
  }

  static validateAcceptInvite(req: Request, res: Response, next: NextFunction) {
    const { invitation, fullName, password } = req.body;
    if (!invitation || !fullName || !password) {
      return next(new BadRequestError("Invitation, full name, and password are required to accept an invitation."));
    }
    next();
  }
}

export default ValidateInviteMiddleware;
