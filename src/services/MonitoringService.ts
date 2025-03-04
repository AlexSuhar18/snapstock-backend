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
  public static async sendLog(eventName: string, details?: any): Promise<{ success: boolean; message: string }> {
    try {
      // 🔹 Asigurăm că modulul este activ
      try {
        ModuleMiddleware.ensureModuleActive('monitoring');
      } catch (error) {
        return { success: false, message: 'Monitoring module is disabled.' };
      }

      // 🔹 Verificăm dacă logarea externă este activată
      if (!LoggerConfig.logToExternal) {
        return { success: false, message: 'External logging is disabled.' };
      }

      // 🔹 Validăm numele evenimentului
      if (!eventName || typeof eventName !== 'string') {
        return { success: false, message: 'Invalid event name provided.' };
      }

      // 🔹 Trimiterea logului către serviciul extern
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secunde

      const response = await fetch(LoggerConfig.externalLogEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, details }),
        signal: controller.signal, // Permite anularea request-ului dacă durează prea mult
      });

      clearTimeout(timeout); // Oprire timeout dacă request-ul a fost completat

      if (!response.ok) {
        throw new Error(`External log failed with status ${response.status}`);
      }

      // 🔥 Emitere eveniment pentru log trimis
      await EventService.emitEvent(EventTypes.EXTERNAL_LOG_SENT, { eventName, details });

      return { success: true, message: 'Log successfully sent to external service.' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('❌ Failed to send log to external service:', errorMessage);

      // 🔥 Emitere eveniment pentru eroare la log extern
      await EventService.emitEvent(EventTypes.EXTERNAL_LOG_FAILED, { eventName, error: errorMessage });

      return { success: false, message: `Failed to send log: ${errorMessage}` };
    }
  }
}

export default MonitoringService;
