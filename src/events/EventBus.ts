import { EventEmitter } from "events";
import { EventTypes, EventData } from "./EventTypes";
import LoggerService from "../services/LoggerService";

/**
 * ✅ EventBus Singleton pentru gestionarea evenimentelor
 */
class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
  }

  /**
   * ✅ Returnează instanța singleton a EventBus
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * ✅ Emitere eveniment tipizat cu gestionare erori
   */
  public emitEvent<T extends EventTypes>(event: T, data: EventData[T]): void {
    if (!Object.values(EventTypes).includes(event)) {
      LoggerService.logError(`⚠️ Attempted to emit unknown event: ${event}`);
      return;
    }

    try {
      LoggerService.logInfo(`📢 Emitting event: ${event}`, data);
      this.emit(event, data);
    } catch (error) {
      LoggerService.logError(`❌ Error emitting event: ${event}`, error);
    }
  }

  /**
   * ✅ Abonare la un eveniment cu verificare și logging
   */
  public subscribe<T extends EventTypes>(event: T, callback: (data: EventData[T]) => void): void {
    if (!Object.values(EventTypes).includes(event)) {
      LoggerService.logError(`⚠️ Attempted to subscribe to unknown event: ${event}`);
      return;
    }

    LoggerService.logInfo(`✅ Subscribed to event: ${event}`);
    this.on(event, callback);
  }

  /**
   * ✅ Dezabonare de la un eveniment pentru gestionarea memoriei
   */
  public unsubscribe<T extends EventTypes>(event: T, callback: (data: EventData[T]) => void): void {
    if (!Object.values(EventTypes).includes(event)) {
      LoggerService.logError(`⚠️ Attempted to unsubscribe from unknown event: ${event}`);
      return;
    }

    LoggerService.logInfo(`❌ Unsubscribed from event: ${event}`);
    this.off(event, callback);
  }
}

export default EventBus.getInstance();
