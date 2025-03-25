import { Request, Response, NextFunction } from "express";
import PluginManager from "../core/PluginManager";
import LoggerService from "../services/LoggerService";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors";

class PluginController {
  private static cachedModules: Record<string, boolean> | null = null;
  private static cacheTimestamp: number | null = null;
  private static CACHE_DURATION_MS = 5000; // Cache pentru 5 secunde

  /**
   * ✅ Obține lista modulelor active/inactive cu caching pentru optimizare
   */
  static async getModules(req: Request, res: Response, next: NextFunction) {
    try {
      // 📌 Verifică dacă avem cache valid
      const now = Date.now();
      if (this.cachedModules && this.cacheTimestamp && now - this.cacheTimestamp < this.CACHE_DURATION_MS) {
        LoggerService.logInfo("📦 Returning cached module list.");
        return res.status(200).json(this.cachedModules);
      }

      // 🏗️ Obține modulele și actualizează cache-ul
      this.cachedModules = PluginManager.getModules();
      this.cacheTimestamp = now;

      LoggerService.logInfo("📦 Modules retrieved successfully.");
      res.status(200).json(this.cachedModules);
    } catch (error) {
      LoggerService.logError("❌ Error fetching modules", error);
      next(error);
    }
  }

  /**
   * ✅ Activează un modul doar dacă există
   */
  static async enableModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleName } = req.params;

      // 🔹 Verifică dacă modulul există în lista modulelor disponibile
      const modules = PluginManager.getModules();
      if (!(moduleName in modules)) {
        throw new NotFoundError(`Module '${moduleName}' does not exist.`);
      }

      if (!PluginManager.isModuleActive(moduleName)) {
        PluginManager.enableModule(moduleName);
        LoggerService.logInfo(`✅ Module '${moduleName}' enabled.`);
        res.status(200).json({ success: true, message: `✅ Module '${moduleName}' enabled successfully.` });
      } else {
        throw new BadRequestError(`⚠️ Module '${moduleName}' is already enabled.`);
      }
    } catch (error) {
      LoggerService.logError("❌ Error enabling module", error);
      next(error);
    }
  }

  /**
   * ✅ Dezactivează un modul doar dacă există și este activ
   */
  static async disableModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleName } = req.params;

      // 🔹 Verifică dacă modulul există
      const modules = PluginManager.getModules();
      if (!(moduleName in modules)) {
        throw new NotFoundError(`Module '${moduleName}' does not exist.`);
      }

      if (PluginManager.isModuleActive(moduleName)) {
        PluginManager.disableModule(moduleName);
        LoggerService.logInfo(`🚫 Module '${moduleName}' disabled.`);
        res.status(200).json({ success: true, message: `🚫 Module '${moduleName}' disabled successfully.` });
      } else {
        throw new BadRequestError(`⚠️ Module '${moduleName}' is already disabled.`);
      }
    } catch (error) {
      LoggerService.logError("❌ Error disabling module", error);
      next(error);
    }
  }

  /**
   * ✅ Reîncarcă modulele din config și curăță cache-ul
   */
  static async reloadModules(req: Request, res: Response, next: NextFunction) {
    try {
      PluginManager.reloadModules();
      this.cachedModules = null; // 🔥 Curățăm cache-ul
      this.cacheTimestamp = null;

      LoggerService.logInfo("🔄 Modules reloaded successfully.");
      res.status(200).json({ success: true, message: "🔄 Modules reloaded successfully." });
    } catch (error) {
      LoggerService.logError("❌ Error reloading modules", error);
      next(error);
    }
  }
}

export default PluginController;
