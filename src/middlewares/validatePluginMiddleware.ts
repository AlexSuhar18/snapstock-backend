import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomErrors";
import PluginService from "../services/PluginService";

class ValidatePluginMiddleware {
  static validateModuleName(req: Request, res: Response, next: NextFunction) {
    const { moduleName } = req.params;
    if (!moduleName) {
      return next(new BadRequestError("Module name is required."));
    }

    if (!PluginService.isValidModule(moduleName)) {
      return next(new BadRequestError(`Invalid module name: ${moduleName}`));
    }

    next();
  }
}

export default ValidatePluginMiddleware;
