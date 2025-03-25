import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";

class ValidateSuperuserMiddleware {
  static validateSetupSuperuser(req: Request, res: Response, next: NextFunction) {
    const { email, fullName } = req.body;
    if (!email || !fullName) {
      return next(new BadRequestError("Missing required fields: email, fullName"));
    }
    next();
  }

  static validateGetSuperuser(req: Request, res: Response, next: NextFunction) {
    const { superuserId } = req.params;
    if (!superuserId) {
      return next(new BadRequestError("Superuser ID is required"));
    }
    next();
  }

  static validateCreateSuperuser(req: Request, res: Response, next: NextFunction) {
    const { email, role } = req.body;

    if (!email || typeof email !== "string") {
      return next(new BadRequestError("❌ Email is required and must be a valid string."));
    }

    if (!role || typeof role !== "string") {
      return next(new BadRequestError("❌ Role is required and must be a valid string."));
    }

    next();
  }

  /**
   * ✅ Validează clonarea unui superuser
   */
  static validateCloneSuperuser(req: Request, res: Response, next: NextFunction) {
    const { superuserId, newEmail } = req.body;

    if (!superuserId || typeof superuserId !== "string") {
      return next(new BadRequestError("❌ Superuser ID is required and must be a valid string."));
    }

    if (!newEmail || typeof newEmail !== "string") {
      return next(new BadRequestError("❌ New email is required and must be a valid string."));
    }

    next();
  }
}

export default ValidateSuperuserMiddleware;
