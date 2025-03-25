import "./StockEvents";
import "./InviteEvents";
import "./SystemEvents";
import LoggerService from "../services/LoggerService";
import EventEmitter from "events";

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // ✅ Permite mai mulți listeneri fără avertismente
  }

  /**
   * ✅ Emetere evenimente cu verificare de listeneri
   */
  emitEvent(eventType: string, payload?: any) {
    if (this.listenerCount(eventType) === 0) {
      LoggerService.logWarn(`⚠️ No listeners found for event: ${eventType}`);
    }

    LoggerService.logInfo(`📡 Emitting event: ${eventType}`, payload);
    this.emit(eventType, payload);
  }

  /**
   * ✅ Integrare viitoare cu RabbitMQ, Redis Pub/Sub sau alte servicii
   */
  async integrateMessagingSystem() {
    if (process.env.EVENT_BUS_TYPE === "rabbitmq") {
      LoggerService.logInfo("📡 Integrating with RabbitMQ (coming soon)");
      // Implementare RabbitMQ viitoare
    } else if (process.env.EVENT_BUS_TYPE === "redis") {
      LoggerService.logInfo("📡 Integrating with Redis Pub/Sub (coming soon)");
      // Implementare Redis viitoare
    } else {
      LoggerService.logInfo("📡 Using default Node.js EventEmitter");
    }
  }
}

const eventBus = new EventBus();

/**
 * ✅ Configurare centralizată EventBus
 */
export default function configureEventBus() {
  LoggerService.logInfo("📡 EventBus configured successfully.");
  eventBus.integrateMessagingSystem(); // Activează integrarea dacă este setată
}

export { eventBus };
