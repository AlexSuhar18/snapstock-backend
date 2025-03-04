import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";

class ValidateLoggerMiddleware {
  static validateLog(req: Request, res: Response, next: NextFunction) {
    const { message } = req.body;
    if (!message) {
      return next(new BadRequestError("Message is required for logging"));
    }
    next();
  }

  static validateLogError(req: Request, res: Response, next: NextFunction) {
    const { message, error } = req.body;
    if (!message || !error) {
      return next(new BadRequestError("Message and error details are required"));
    }
    next();
  }
}

export default ValidateLoggerMiddleware;
