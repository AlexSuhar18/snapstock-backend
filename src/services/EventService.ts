import { EventEmitter } from "events";
import LoggerService from "../services/LoggerService";
import { EventTypes, EventData } from "../events/EventTypes";

class EventService {
  private static eventEmitter = new EventEmitter();

  /**
   * ✅ Înregistrează un listener pentru un anumit eveniment
   */
  public static on<T extends EventTypes>(
    event: T,
    listener: (data: EventData[T]) => void
  ): { success: boolean; message?: string } {
    try {
      this.eventEmitter.on(event, listener);
      LoggerService.logInfo(`🎧 Listener added for event: ${event}`);
      return { success: true, message: `Listener added for event: ${event}` };
    } catch (error) {
      LoggerService.logError(`❌ Error adding listener for event: ${event}`, error);
      return { success: false, message: `Error adding listener: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  /**
   * ✅ Emette un eveniment și loghează informațiile relevante
   */
  public static async emitEvent<T extends EventTypes>(
    event: T,
    payload: EventData[T]
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.validateEvent(event, payload)) {
        throw new Error(`Invalid event payload for event: ${event}`);
      }

      this.eventEmitter.emit(event, payload);
      LoggerService.logInfo(`📢 Event emitted: ${event}`, payload);
      return { success: true, message: `Event ${event} emitted successfully.` };
    } catch (error) {
      LoggerService.logError(`❌ Error emitting event: ${event}`, error);
      return { success: false, message: `Error emitting event: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  /**
   * ✅ Elimină un listener pentru un anumit eveniment
   */
  public static removeListener<T extends EventTypes>(
    event: T,
    listener: (data: EventData[T]) => void
  ): { success: boolean; message?: string } {
    try {
      this.eventEmitter.removeListener(event, listener);
      LoggerService.logInfo(`🔇 Listener removed for event: ${event}`);
      return { success: true, message: `Listener removed for event: ${event}` };
    } catch (error) {
      LoggerService.logError(`❌ Error removing listener for event: ${event}`, error);
      return { success: false, message: `Error removing listener: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  /**
   * ✅ Elimină TOȚI listenerii pentru un eveniment
   */
  public static removeAllListeners<T extends EventTypes>(
    event: T
  ): { success: boolean; message?: string } {
    try {
      this.eventEmitter.removeAllListeners(event);
      LoggerService.logInfo(`🚫 All listeners removed for event: ${event}`);
      return { success: true, message: `All listeners removed for event: ${event}` };
    } catch (error) {
      LoggerService.logError(`❌ Error removing all listeners for event: ${event}`, error);
      return { success: false, message: `Error removing all listeners: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  /**
   * ✅ Obține TOȚI listenerii activi pentru un eveniment
   */
  public static getListeners<T extends EventTypes>(
    event: T
  ): { success: boolean; listeners: Function[]; message?: string } {
    try {
      const listeners = this.eventEmitter.listeners(event);
      return { success: true, listeners };
    } catch (error) {
      LoggerService.logError(`❌ Error fetching listeners for event: ${event}`, error);
      return { success: false, listeners: [], message: `Error fetching listeners: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  /**
   * ✅ Verifică dacă un eveniment are cel puțin un listener activ
   */
  public static hasListeners<T extends EventTypes>(
    event: T
  ): { success: boolean; hasListeners: boolean; message?: string } {
    try {
      const hasListeners = this.eventEmitter.listenerCount(event) > 0;
      return { success: true, hasListeners };
    } catch (error) {
      LoggerService.logError(`❌ Error checking listeners for event: ${event}`, error);
      return { success: false, hasListeners: false, message: `Error checking listeners: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  /**
   * ✅ Validează payload-ul unui eveniment înainte de a-l emite
   */
  public static validateEvent<T extends EventTypes>(event: T, payload: any): boolean {
    if (!event || !payload) {
      LoggerService.logError(`❌ Invalid event or payload: ${event}`, payload);
      return false;
    }

    // Adaugă logica specifică pentru validarea fiecărui tip de eveniment
    switch (event) {
      case EventTypes.EMAIL_SENT:
        return typeof payload.to === "string" && typeof payload.subject === "string";
      case EventTypes.LOG_ERROR:
        return typeof payload.message === "string" && typeof payload.error === "object";
      case EventTypes.STOCK_UPDATED:
        return typeof payload.stockId === "string" && typeof payload.quantity === "number";
      default:
        LoggerService.logWarn(`⚠️ No validation rule defined for event: ${event}`);
        return true;
    }
  }
}

export default EventService;
