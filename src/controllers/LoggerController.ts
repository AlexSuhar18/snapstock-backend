import { Request, Response, NextFunction } from 'express';
import LoggerService from '../services/LoggerService';
import EventService from '../services/EventService';
import { EventTypes } from '../events/EventTypes';
import { BadRequestError } from '../errors/CustomErrors';

class LoggerController {
  /**
   * ✅ Logare INFO și emitere eveniment
   */
  static async logEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;
      if (!message) {
        throw new BadRequestError('Message is required for logging');
      }

      LoggerService.logInfo(message, details);
      await EventService.emitEvent(EventTypes.LOG_INFO, { message, details });

      res.status(200).json({ success: true, message: 'Log event recorded' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ Logare ERROR și emitere eveniment
   */
  static async logError(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, error } = req.body;
      if (!message || !error) {
        throw new BadRequestError('Message and error details are required');
      }

      LoggerService.logError(message, error);
      await EventService.emitEvent(EventTypes.LOG_ERROR, { message, error });

      res.status(200).json({ success: true, message: 'Error logged successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ Logare WARN și emitere eveniment
   */
  static async logWarn(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;
      if (!message) {
        throw new BadRequestError('Message is required for warning logs');
      }

      LoggerService.logWarn(message, details);
      await EventService.emitEvent(EventTypes.LOG_WARN, { message, details });

      res.status(200).json({ success: true, message: 'Warning logged successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ Logare DEBUG și emitere eveniment
   */
  static async logDebug(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, details } = req.body;
      if (!message) {
        throw new BadRequestError('Message is required for debug logs');
      }

      LoggerService.logDebug(message, details);
      await EventService.emitEvent(EventTypes.LOG_DEBUG, { message, details });

      res.status(200).json({ success: true, message: 'Debug log recorded' });
    } catch (error) {
      next(error);
    }
  }
}

export default LoggerController;
