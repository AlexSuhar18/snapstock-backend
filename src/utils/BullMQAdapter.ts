import { RedisClientType } from "redis";

/**
 * ✅ Adaptor pentru a face conexiunea Redis compatibilă cu BullMQ
 */
export class BullMQAdapter {
  public static getBullMQConnection(redisClient: RedisClientType) {
    return {
      host: (redisClient as any).options?.socket?.host ?? "127.0.0.1",
      port: (redisClient as any).options?.socket?.port ?? 6379,
    };
  }
}
