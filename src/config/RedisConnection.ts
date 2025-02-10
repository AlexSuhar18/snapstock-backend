import { createClient, RedisClientType } from "redis";
import { RedisConfig } from "./RedisConfig";
import LoggerService from "../services/LoggerService";

/**
 * ✅ Singleton pentru conexiunea Redis
 */
class RedisConnection {
  private static instance: RedisClientType | null = null;

  private constructor() {} // 🔹 Constructor privat pentru a preveni instanțierea directă

  /**
   * ✅ Inițializează și returnează conexiunea Redis
   */
  public static getInstance(): RedisClientType {
    if (!this.instance) {
      this.instance = createClient({
        url: RedisConfig.url,
        socket: { reconnectStrategy: RedisConfig.reconnectStrategy },
      });

      this.instance.on("connect", () => LoggerService.logInfo("🔗 Connected to Redis"));
      this.instance.on("error", (err) => LoggerService.logError("❌ Redis Error:", err));

      this.instance.connect().catch((error) => {
        LoggerService.logError("❌ Failed to connect to Redis:", error);
      });
    }

    return this.instance;
  }
}

export default RedisConnection;