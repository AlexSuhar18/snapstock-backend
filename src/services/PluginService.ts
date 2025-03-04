import PluginManager from "../core/PluginManager";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

class PluginService {
  /**
   * ✅ Obține lista modulelor active/inactive
   */
  static getModules(): { success: boolean; data: Record<string, boolean> } {
    return { success: true, data: PluginManager.getModules() };
  }

  /**
   * ✅ Verifică dacă un modul este valid
   */
  static isValidModule(moduleName: string): boolean {
    const modules = this.getModules().data;
    return Object.keys(modules).includes(moduleName);
  }

  /**
   * ✅ Activează un modul și emite un eveniment
   */
  static async enableModule(moduleName: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isValidModule(moduleName)) {
        return { success: false, message: `Invalid module name: ${moduleName}` };
      }

      PluginManager.enableModule(moduleName);
      await EventService.emitEvent(EventTypes.MODULE_ENABLED, { moduleName })
        .catch(error => LoggerService.logError("❌ Error emitting MODULE_ENABLED event", error));

      LoggerService.logInfo(`✅ Module '${moduleName}' enabled.`);
      return { success: true, message: `Module '${moduleName}' enabled successfully.` };
    } catch (error) {
      LoggerService.logError("❌ Error enabling module", error);
      return { success: false, message: "Error enabling module." };
    }
  }

  /**
   * ✅ Dezactivează un modul și emite un eveniment
   */
  static async disableModule(moduleName: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isValidModule(moduleName)) {
        return { success: false, message: `Invalid module name: ${moduleName}` };
      }

      PluginManager.disableModule(moduleName);
      await EventService.emitEvent(EventTypes.MODULE_DISABLED, { moduleName })
        .catch(error => LoggerService.logError("❌ Error emitting MODULE_DISABLED event", error));

      LoggerService.logInfo(`🚫 Module '${moduleName}' disabled.`);
      return { success: true, message: `Module '${moduleName}' disabled successfully.` };
    } catch (error) {
      LoggerService.logError("❌ Error disabling module", error);
      return { success: false, message: "Error disabling module." };
    }
  }

  /**
   * ✅ Reîncarcă modulele și emite un eveniment
   */
  static async reloadModules(): Promise<{ success: boolean; message: string }> {
    try {
      PluginManager.reloadModules();
      await EventService.emitEvent(EventTypes.MODULES_RELOADED, {moduleName: "all"})
        .catch(error => LoggerService.logError("❌ Error emitting MODULES_RELOADED event", error));

      LoggerService.logInfo("🔄 Modules reloaded successfully.");
      return { success: true, message: "Modules reloaded successfully." };
    } catch (error) {
      LoggerService.logError("❌ Error reloading modules", error);
      return { success: false, message: "Error reloading modules." };
    }
  }
}

export default PluginService;
