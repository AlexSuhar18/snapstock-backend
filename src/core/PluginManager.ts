import fs from 'fs';
import path from 'path';
import EventService from '../services/EventService';
import { EventTypes } from '../events/EventTypes';

const PLUGINS_FILE = path.join(__dirname, '../config/plugins.json');

class PluginManager {
  private static plugins: Record<string, boolean> = PluginManager.loadPlugins();
  private static cacheActiveModules: string[] | null = null; // 🔹 Adăugat caching

  /**
   * ✅ Încarcă modulele din fișier JSON
   */
  private static loadPlugins(): Record<string, boolean> {
    try {
      const data = fs.readFileSync(PLUGINS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('⚠️ Error loading plugins:', error);
      return {};
    }
  }

  /**
   * ✅ Salvează configurarea modulelor în fișier
   */
  private static savePlugins(): void {
    try {
      fs.writeFileSync(PLUGINS_FILE, JSON.stringify(this.plugins, null, 2), 'utf-8');
      this.cacheActiveModules = null; // 🔹 Resetăm cache-ul la fiecare modificare
    } catch (error) {
      console.error('⚠️ Error saving plugins:', error);
    }
  }

  /**
   * ✅ Verifică dacă un modul este activ
   */
  static isModuleActive(moduleName: string): boolean {
    return this.plugins[moduleName] ?? false;
  }

  /**
   * ✅ Activează un modul
   */
  static enableModule(moduleName: string): void {
    if (this.plugins[moduleName] !== undefined) {
      this.plugins[moduleName] = true;
      this.savePlugins();
      EventService.emitEvent(EventTypes.MODULE_ENABLED, { moduleName });
      console.log(`✅ Module enabled: ${moduleName}`);
    } else {
      console.warn(`⚠️ Module not found: ${moduleName}`);
    }
  }

  /**
   * ✅ Dezactivează un modul
   */
  static disableModule(moduleName: string): void {
    if (this.plugins[moduleName] !== undefined) {
      this.plugins[moduleName] = false;
      this.savePlugins();
      EventService.emitEvent(EventTypes.MODULE_DISABLED, { moduleName });
      console.log(`🚫 Module disabled: ${moduleName}`);
    } else {
      console.warn(`⚠️ Module not found: ${moduleName}`);
    }
  }

  /**
   * ✅ Reîncarcă configurarea modulelor
   */
  static reloadModules(): void {
    this.plugins = this.loadPlugins();
    this.cacheActiveModules = null; // 🔹 Resetăm cache-ul la reload
    console.log('🔄 Plugins reloaded.');
  }

  /**
   * ✅ Obține lista modulelor active
   */
  static getActiveModules(): string[] {
    if (!this.cacheActiveModules) {
      this.cacheActiveModules = Object.keys(this.plugins).filter(module => this.plugins[module]);
    }
    return this.cacheActiveModules;
  }

  /**
   * ✅ Obține lista completă a modulelor
   */
  static getModules(): Record<string, boolean> {
    return this.plugins;
  }
}

export default PluginManager;
