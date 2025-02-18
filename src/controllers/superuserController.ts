import { Request, Response, NextFunction } from 'express';
import SuperuserService from '../services/SuperuserService';
import LoggerService from '../services/LoggerService';
import EventService from '../services/EventService';
import { EventTypes } from "../events/EventTypes";
import { BadRequestError, NotFoundError } from '../errors/CustomErrors';

export class SuperuserHandlers {
  /**
   * ✅ Creează un superuser
   */
  static async setupSuperuser(req: Request, res: Response, next: NextFunction) {
    try {
      SuperuserHandlers.validateRequest(req, ['email', 'fullName']);

      const created = await SuperuserService.setupSuperuser({
        email: req.body.email,
        fullName: req.body.fullName,
        password: 'password',
      });

      if (!created) {
        throw new BadRequestError('Superuser already exists');
      }

      await EventService.emitEvent(EventTypes.SUPERUSER_SETUP, { 
        superuserId: created.id, 
        email: created.email 
      });

      LoggerService.logInfo(`✅ Superuser created: ${created.email}`);
      res.status(201).json({ message: '✅ Superuser created successfully' });
    } catch (error) {
      LoggerService.logError('❌ Error setting up superuser', error);
      next(error);
    }
  }

  /**
   * ✅ Obține un superuser
   */
  static async getSuperuser(req: Request, res: Response, next: NextFunction) {
    try {
      SuperuserHandlers.validateRequest(req, ['superuserId']);

      const superuser = await SuperuserService.getSuperuser(req.params.superuserId);
      if (!superuser) {
        throw new NotFoundError('Superuser not found');
      }

      res.status(200).json(superuser);
    } catch (error) {
      LoggerService.logError('❌ Error fetching superuser', error);
      next(error);
    }
  }

  /**
   * ✅ Obține toți superuserii
   */
  static async getAllSuperusers(req: Request, res: Response, next: NextFunction) {
    try {
      const superusers = await SuperuserService.getAllSuperusers();
      if (!superusers || superusers.length === 0) {
        throw new NotFoundError('No superusers found');
      }

      res.status(200).json(superusers);
    } catch (error) {
      LoggerService.logError('❌ Error fetching all superusers', error);
      next(error);
    }
  }

  /**
   * ✅ Șterge toți superuserii
   */
  static async deleteAllSuperusers(req: Request, res: Response, next: NextFunction) {
    try {
      await SuperuserService.deleteAllSuperusers();
      await EventService.emitEvent(EventTypes.ALL_SUPERUSERS_DELETED, {});
      LoggerService.logInfo('🗑️ All superusers deleted');

      res.status(200).json({ message: '✅ All superusers deleted successfully' });
    } catch (error) {
      LoggerService.logError('❌ Error deleting all superusers', error);
      next(error);
    }
  }

  /**
   * ✅ Șterge un superuser
   */
  static async deleteSuperuser(req: Request, res: Response, next: NextFunction) {
    try {
      SuperuserHandlers.validateRequest(req, ['superuserId']);
      const { superuserId } = req.params;

      if (superuserId === 'mainSuperuser') {
        throw new BadRequestError('⛔ Cannot delete the main superuser');
      }

      await SuperuserService.deleteSuperuser(superuserId);

      await EventService.emitEvent(EventTypes.SUPERUSER_DELETED, { 
        superuserId 
      });

      LoggerService.logInfo(`🗑️ Superuser deleted: ID ${superuserId}`);

      res.status(200).json({ message: `✅ Superuser with ID ${superuserId} deleted successfully` });
    } catch (error) {
      LoggerService.logError('❌ Error deleting superuser', error);
      next(error);
    }
  }

  /**
   * ✅ Clonează un superuser
   */
  static async cloneSuperuser(req: Request, res: Response, next: NextFunction) {
    try {
      SuperuserHandlers.validateRequest(req, ['email', 'fullName']);

      const cloned = await SuperuserService.cloneSuperuser({
        email: req.body.email,
        fullName: req.body.fullName,
      });

      if (!cloned) {
        throw new BadRequestError('Superuser not cloned');
      }

      await EventService.emitEvent(EventTypes.SUPERUSER_CLONED, { 
        superuserId: cloned.id, 
        email: cloned.email 
      });

      LoggerService.logInfo(`🔄 Superuser cloned: ${cloned.email}`);

      res.status(201).json({ message: '✅ Superuser cloned successfully' });
    } catch (error) {
      LoggerService.logError('❌ Error cloning superuser', error);
      next(error);
    }
  }

  /**
   * 🔹 Metodă privată pentru validarea datelor din request
   */
  private static validateRequest(req: Request, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!req.body[field] && !req.params[field]) {
        throw new BadRequestError(`Missing required field: ${field}`);
      }
    }
  }
}

