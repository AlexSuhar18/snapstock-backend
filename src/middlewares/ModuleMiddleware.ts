import { Request, Response, NextFunction } from "express";
import PluginManager from "../core/PluginManager";
import { ForbiddenError } from "../errors/CustomErrors";
import LoggerService from "../services/LoggerService";
import dotenv from "dotenv";

dotenv.config();

/**
 * ✅ Middleware pentru gestionarea activării modulelor în Express
 */
class ModuleMiddleware {
  /**
   * ✅ Middleware care verifică activarea unui modul
   * (Folosit în rutele Express)
   */
  static checkModule(moduleName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const allowInactiveModules = process.env.ALLOW_INACTIVE_MODULES === "true";

      if (!PluginManager.isModuleActive(moduleName)) {
        LoggerService.logWarn(`🚫 Access denied: ${moduleName} module is disabled`, {
          module: moduleName,
          path: req.path,
          method: req.method,
          ip: req.ip,
        });

        if (allowInactiveModules) {
          LoggerService.logInfo(`⚠️ Allowing access to inactive module: ${moduleName}`);
          return next();
        }

        return next(new ForbiddenError(`🚫 Access denied: The '${moduleName}' module is disabled.`));
      }
      next();
    };
  }

  /**
   * ✅ Verifică activarea unui modul și permite fallback în cazul în care este dezactivat
   * (Pentru utilizare în servicii și controllere)
   */
  static ensureModuleActive(moduleName: string, fallback?: () => void) {
    try {
      const allowInactiveModules = process.env.ALLOW_INACTIVE_MODULES === "true";

      if (!PluginManager.isModuleActive(moduleName)) {
        LoggerService.logWarn(`🚫 Attempt to use disabled module: ${moduleName}`, {
          module: moduleName,
        });

        if (allowInactiveModules) {
          LoggerService.logInfo(`⚠️ Allowing operation despite module '${moduleName}' being disabled.`);
          return;
        }

        if (fallback) {
          LoggerService.logInfo(`⚠️ Using fallback for disabled module: ${moduleName}`);
          fallback();
        } else {
          throw new ForbiddenError(`🚫 The '${moduleName}' module is disabled and no fallback is available.`);
        }
      }
    } catch (error) {
      LoggerService.logError(`❌ Error in ensureModuleActive for module: ${moduleName}`, error);
      throw error;
    }
  }
}

export default ModuleMiddleware;
