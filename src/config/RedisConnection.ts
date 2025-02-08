import IORedis from "ioredis";

class RedisConnection {
  private static instance: IORedis;

  private constructor() {}

  public static getInstance(): IORedis {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new IORedis({
        host: "127.0.0.1",
        port: 6379,
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
      });
    }
    return RedisConnection.instance;
  }
}

export default RedisConnection.getInstance(); // 🔹 Exportăm instanța direct
