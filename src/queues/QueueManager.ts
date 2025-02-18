import { Queue, QueueEvents } from "bullmq";
import RedisConnection from "../config/RedisConnection";
import { BullMQAdapter } from "../utils/BullMQAdapter";

class QueueManager {
  private static instance: QueueManager;
  private queue: Queue | null = null;
  private queueEvents: QueueEvents | null = null;

  private constructor() {}

  /**
   * ✅ Inițializează coada BullMQ doar după ce conexiunea Redis este disponibilă
   */
  public static async getInstance(): Promise<QueueManager> {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
      await QueueManager.instance.initializeQueue();
    }
    return QueueManager.instance;
  }

  /**
   * ✅ Creează instanțele de Queue și QueueEvents
   */
  private async initializeQueue() {
    const redisClient = await RedisConnection.getInstance();
    const connection = BullMQAdapter.getBullMQConnection(redisClient);

    this.queue = new Queue("invitationQueue", {
      connection, // ✅ Folosim conexiunea compatibilă BullMQ
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
      connection, // ✅ Folosim aceeași conexiune pentru evenimente
    });

    console.log("✅ BullMQ Queue initialized");
  }

  /**
   * ✅ Obține instanța cozii BullMQ
   */
  public getQueue(): Queue {
    if (!this.queue) {
      throw new Error("Queue is not initialized yet.");
    }
    return this.queue;
  }

  /**
   * ✅ Adaugă un job în coadă
   */
  public async addJob(jobName: string, data: any): Promise<void> {
    if (!this.queue) {
      throw new Error("Queue is not initialized yet.");
    }
    const job = await this.queue.add(jobName, data);
    console.log(`✅ Job "${jobName}" added with ID: ${job.id}`);
  }
}

// ✅ Exportăm singleton-ul QueueManager
export default QueueManager.getInstance();
