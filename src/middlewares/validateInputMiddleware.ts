import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";

class ValidateInputMiddleware {
  static validatePassword(req: Request, res: Response, next: NextFunction) {
    if (!req.body.password) {
      return next(new BadRequestError("Password is required."));
    }
    next();
  }

  static validateEmail(req: Request, res: Response, next: NextFunction) {
    if (!req.body.email) {
      return next(new BadRequestError("Email is required."));
    }
    next();
  }

  static validateDomain(req: Request, res: Response, next: NextFunction) {
    if (!req.body.domain) {
      return next(new BadRequestError("Domain is required."));
    }
    next();
  }
}

export default ValidateInputMiddleware;
