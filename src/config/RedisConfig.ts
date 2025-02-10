import dotenv from "dotenv";

dotenv.config();

/**
 * ✅ Configurare pentru conexiunea Redis
 */
export const RedisConfig = {
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  reconnectStrategy: (retries: number) => Math.min(retries * 50, 1000),
};
