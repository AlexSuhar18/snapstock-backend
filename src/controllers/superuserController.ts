import { Request, Response, NextFunction } from "express";
import SuperuserService from "../services/SuperuserService";
import LoggerService from "../services/LoggerService";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors";
import validateSuperuserMiddleware from "../middlewares/validateSuperuserMiddleware";

class SuperuserController {
  /**
   * ✅ Creează un superuser
   */
  static async setupSuperuser(req: Request, res: Response, next: NextFunction) {
    try {
      // 🔹 Validare input
      validateSuperuserMiddleware.validateCreateSuperuser(req, res, next);

      const response = await SuperuserService.setupSuperuser(req.body);
      LoggerService.logInfo(`✅ Superuser created: ${response.email}`);
      res.status(201).json({ message: "✅ Superuser created successfully", superuser: response });
    } catch (error) {
      LoggerService.logError("❌ Error setting up superuser", error);
      next(error);
    }
  }

  /**
   * ✅ Obține un superuser
   */
  static async getSuperuser(req: Request, res: Response, next: NextFunction) {
    try {
      const { superuserId } = req.params;

      // 🔹 Verifică dacă superuserId este valid
      if (!superuserId) {
        return next(new BadRequestError("❌ Superuser ID is required."));
      }

      const response = await SuperuserService.getSuperuser(superuserId);

      if (!response) {
        return next(new NotFoundError(`❌ Superuser with ID ${superuserId} not found.`));
      }

      LoggerService.logInfo(`📋 Retrieved superuser: ${superuserId}`);
      res.status(200).json(response);
    } catch (error) {
      LoggerService.logError("❌ Error fetching superuser", error);
      next(error);
    }
  }

  /**
   * ✅ Obține toți superuserii
   */
  static async getAllSuperusers(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await SuperuserService.getAllSuperusers();
      LoggerService.logInfo("📋 Retrieved all superusers.");
      res.status(200).json(response);
    } catch (error) {
      LoggerService.logError("❌ Error fetching all superusers", error);
      next(error);
    }
  }

  /**
   * ✅ Șterge toți superuserii
   */
  static async deleteAllSuperusers(req: Request, res: Response, next: NextFunction) {
    try {
      await SuperuserService.deleteAllSuperusers();
      LoggerService.logInfo("🗑️ All superusers deleted");
      res.status(200).json({ message: "✅ All superusers deleted successfully" });
    } catch (error) {
      LoggerService.logError("❌ Error deleting all superusers", error);
      next(error);
    }
  }

  /**
   * ✅ Șterge un superuser
   */
  static async deleteSuperuser(req: Request, res: Response, next: NextFunction) {
    try {
      const { superuserId } = req.params;

      // 🔹 Verifică dacă superuserId este valid
      if (!superuserId) {
        return next(new BadRequestError("❌ Superuser ID is required."));
      }

      // 🔹 Verifică dacă superuser-ul există
      const superuserExists = await SuperuserService.getSuperuser(superuserId);
      if (!superuserExists) {
        return next(new NotFoundError(`❌ Superuser with ID ${superuserId} not found.`));
      }

      await SuperuserService.deleteSuperuser(superuserId);
      LoggerService.logInfo(`🗑️ Superuser deleted: ID ${superuserId}`);
      res.status(200).json({ message: `✅ Superuser with ID ${superuserId} deleted successfully` });
    } catch (error) {
      LoggerService.logError("❌ Error deleting superuser", error);
      next(error);
    }
  }

  /**
   * ✅ Clonează un superuser
   */
  static async cloneSuperuser(req: Request, res: Response, next: NextFunction) {
    try {
      // 🔹 Validare input
      validateSuperuserMiddleware.validateCloneSuperuser(req, res, next);

      const response = await SuperuserService.cloneSuperuser(req.body);
      LoggerService.logInfo(`🔄 Superuser cloned: ${response.email}`);
      res.status(201).json({ message: "✅ Superuser cloned successfully", superuser: response });
    } catch (error) {
      LoggerService.logError("❌ Error cloning superuser", error);
      next(error);
    }
  }
}

export default SuperuserController;
