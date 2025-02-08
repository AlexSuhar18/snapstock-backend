import { Queue } from "bullmq";
import IORedis from "ioredis";

export class InvitationQueueManager {
  private static instance: InvitationQueueManager;
  private queue: Queue;
  private connection: IORedis;

  private constructor() {
    this.connection = new IORedis({
      host: "127.0.0.1",
      port: 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue("invitationQueue", {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 5, // 🔹 Jobul va fi reîncercat de 5 ori
        backoff: {
          type: "exponential",
          delay: 5000, // 🔹 Fiecare retry va aștepta mai mult
        },
        removeOnComplete: true,
        removeOnFail: 10, // 🔹 Păstrăm ultimele 10 joburi eșuate în Redis
      },
    });
  }

  // 🔹 Singleton - asigură o singură instanță globală a managerului de coadă
  public static getInstance(): InvitationQueueManager {
    if (!InvitationQueueManager.instance) {
      InvitationQueueManager.instance = new InvitationQueueManager();
    }
    return InvitationQueueManager.instance;
  }

  // 🔹 Metodă pentru adăugarea unui job în coadă
  public async addJob(jobName: string, data: any): Promise<void> {
    await this.queue.add(jobName, data);
    console.log(`✅ Job ${jobName} added to queue with data:`, data);
  }
}

// Export Singleton-ul direct
export default InvitationQueueManager.getInstance();
