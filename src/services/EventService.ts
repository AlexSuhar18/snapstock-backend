import { EventEmitter } from "events";
import LoggerService from "../services/LoggerService";
import { EventTypes, EventData } from "../events/EventTypes";

/**
 * ✅ Serviciu centralizat pentru gestionarea evenimentelor
 */
class EventService {
  private static eventEmitter = new EventEmitter();

  /**
   * ✅ Înregistrează un listener pentru un anumit eveniment
   */
  public static on<T extends EventTypes>(
    event: T,
    listener: (data: EventData[T]) => void
  ): void {
    this.eventEmitter.on(event, listener);
    LoggerService.logInfo(`🎧 Listener added for event: ${event}`);
  }

  /**
   * ✅ Emette un eveniment și loghează informațiile relevante
   */
  public static async emitEvent<T extends EventTypes>(
    event: T,
    payload: EventData[T]
  ): Promise<void> {
    try {
      this.eventEmitter.emit(event, payload);
      LoggerService.logInfo(`📢 Event emitted: ${event}`, payload);
    } catch (error) {
      LoggerService.logError(`❌ Error emitting event: ${event}`, error);
    }
  }

  /**
   * ✅ Elimină un listener pentru un anumit eveniment
   */
  public static removeListener<T extends EventTypes>(
    event: T,
    listener: (data: EventData[T]) => void
  ): void {
    this.eventEmitter.removeListener(event, listener);
    LoggerService.logInfo(`🔇 Listener removed for event: ${event}`);
  }
}

export default EventService;
