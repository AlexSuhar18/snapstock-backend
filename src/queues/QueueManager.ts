import { Queue, QueueEvents } from "bullmq";
import RedisConnection from "../config/RedisConnection"; // 🔹 Acum importăm direct instanța

class QueueManager {
  private static instance: QueueManager;
  private queue: Queue;
  private queueEvents: QueueEvents;

  private constructor() {
    this.queue = new Queue("invitationQueue", {
      connection: RedisConnection, // 🔹 Acum `RedisConnection` este un obiect valid
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: 10,
      },
    });

    this.queueEvents = new QueueEvents("invitationQueue", {
      connection: RedisConnection, // 🔹 Folosim aceeași conexiune
    });
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  // 🔹 Metodă publică pentru a obține instanța cozii
  public getQueue(): Queue {
    return this.queue;
  }

  public async addJob(jobName: string, data: any): Promise<void> {
    const job = await this.queue.add(jobName, data);
    console.log(`✅ Job "${jobName}" added with ID: ${job.id}`);
  }
}

export default QueueManager.getInstance();