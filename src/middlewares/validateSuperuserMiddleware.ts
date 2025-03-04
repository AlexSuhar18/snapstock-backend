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
}

export default ValidateSuperuserMiddleware;
