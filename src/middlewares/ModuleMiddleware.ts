import { Request, Response, NextFunction } from "express";
import PluginManager from "../core/PluginManager";
import { ForbiddenError } from "../errors/CustomErrors";
import LoggerService from "../services/LoggerService";

class ModuleMiddleware {
  /**
   * ✅ Middleware pentru verificarea activării modulelor în Express
   */
  static checkModule(moduleName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!PluginManager.isModuleActive(moduleName)) {
        LoggerService.logWarn(`🚫 Access denied: ${moduleName} module is disabled`, {
          module: moduleName,
          path: req.path,
          method: req.method,
          ip: req.ip,
        });
        return next(new ForbiddenError(`${moduleName} module is disabled`));
      }
      next();
    };
  }

  /**
   * ✅ Verifică dacă un modul este activ și aruncă o eroare dacă este dezactivat
   * (Pentru utilizare în servicii și controllere)
   */
  static ensureModuleActive(moduleName: string) {
    if (!PluginManager.isModuleActive(moduleName)) {
      LoggerService.logWarn(`🚫 Attempt to use disabled module: ${moduleName}`);
      throw new ForbiddenError(`${moduleName} module is disabled`);
    }
  }
}

export default ModuleMiddleware;
