import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import PluginService from "../services/PluginService";
import LoggerService from "../services/LoggerService";

class ValidatePluginMiddleware {
  /**
   * ✅ Validează numele modulului primit ca parametru
   */
  static validateModuleName(req: Request, res: Response, next: NextFunction) {
    const { moduleName } = req.params;

    if (!moduleName) {
      LoggerService.logWarn("❌ Missing moduleName in request params.");
      return next(new BadRequestError("Module name is required."));
    }

    if (!PluginService.isValidModule(moduleName)) {
      LoggerService.logWarn(`❌ Invalid module name: ${moduleName}`);
      return next(new BadRequestError(`Invalid module name: ${moduleName}`));
    }

    next();
  }

  /**
   * ✅ Validează payload-ul de creare/activare plugin
   */
  static validatePluginPayload(req: Request, res: Response, next: NextFunction) {
    const { name, version, enabled } = req.body;

    if (!name || typeof name !== "string") {
      LoggerService.logWarn("❌ Plugin name missing or invalid.");
      return next(new BadRequestError("Plugin 'name' is required and must be a string."));
    }

    if (!version || typeof version !== "string") {
      LoggerService.logWarn("❌ Plugin version missing or invalid.");
      return next(new BadRequestError("Plugin 'version' is required and must be a string."));
    }

    if (typeof enabled !== "boolean") {
      LoggerService.logWarn("❌ Plugin 'enabled' flag is missing or not boolean.");
      return next(new BadRequestError("Plugin 'enabled' is required and must be a boolean."));
    }

    const isDuplicate = PluginService.isPluginDuplicate(name, version);
    if (isDuplicate) {
      LoggerService.logWarn(`❌ Plugin already exists: ${name}@${version}`);
      return next(new BadRequestError(`Plugin ${name}@${version} already exists.`));
    }

    next();
  }
}

export default ValidatePluginMiddleware;
