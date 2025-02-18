import LoggerConfig from '../config/LoggerConfig';
import EventService from '../services/EventService';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';
import { EventTypes } from '../events/EventTypes';

/**
 * ✅ Serviciu pentru logare externă (ex: DataDog, Sentry, LogServer)
 */
class MonitoringService {
  /**
   * ✅ Trimite un log către un serviciu extern, utilizând middleware-ul
   */
  public static async sendLog(eventName: string, details?: any): Promise<void> {
    try {
      ModuleMiddleware.ensureModuleActive('monitoring'); // 🔹 Middleware în loc de PluginManager

      if (!LoggerConfig.logToExternal) return;

      await fetch(LoggerConfig.externalLogEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, details }),
      });

      await EventService.emitEvent(EventTypes.EXTERNAL_LOG_SENT, { eventName, details });
    } catch (error) {
      console.error('❌ Failed to send log to external service:', error);
      await EventService.emitEvent(EventTypes.EXTERNAL_LOG_FAILED, { eventName, error });
    }
  }
}

export default MonitoringService;