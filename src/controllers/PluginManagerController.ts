import { Request, Response, NextFunction } from "express";
import PluginManager from "../core/PluginManager";
import LoggerService from "../services/LoggerService";
import { BadRequestError } from "../errors/CustomErrors";

class PluginController {
  /**
   * ✅ Obține lista modulelor active/inactive
   */
  static async getModules(req: Request, res: Response, next: NextFunction) {
    try {
      const modules = PluginManager.getModules();
      res.status(200).json(modules);
    } catch (error) {
      LoggerService.logError("❌ Error fetching modules", error);
      next(error);
    }
  }

  /**
   * ✅ Activează un modul
   */
  static async enableModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleName } = req.params;
      if (!PluginManager.isModuleActive(moduleName)) {
        PluginManager.enableModule(moduleName);
        LoggerService.logInfo(`✅ Module '${moduleName}' enabled.`);
        res.status(200).json({ message: `Module '${moduleName}' enabled successfully.` });
      } else {
        throw new BadRequestError(`Module '${moduleName}' is already enabled.`);
      }
    } catch (error) {
      LoggerService.logError("❌ Error enabling module", error);
      next(error);
    }
  }

  /**
   * ✅ Dezactivează un modul
   */
  static async disableModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleName } = req.params;
      if (PluginManager.isModuleActive(moduleName)) {
        PluginManager.disableModule(moduleName);
        LoggerService.logInfo(`🚫 Module '${moduleName}' disabled.`);
        res.status(200).json({ message: `Module '${moduleName}' disabled successfully.` });
      } else {
        throw new BadRequestError(`Module '${moduleName}' is already disabled.`);
      }
    } catch (error) {
      LoggerService.logError("❌ Error disabling module", error);
      next(error);
    }
  }

  /**
   * ✅ Reîncarcă modulele din config
   */
  static async reloadModules(req: Request, res: Response, next: NextFunction) {
    try {
      PluginManager.reloadModules();
      LoggerService.logInfo("🔄 Modules reloaded successfully.");
      res.status(200).json({ message: "Modules reloaded successfully." });
    } catch (error) {
      LoggerService.logError("❌ Error reloading modules", error);
      next(error);
    }
  }
}

export default PluginController;
