import { Worker, Job } from "bullmq";
import RedisConnection from "../config/RedisConnection";
import QueueMetricsManager from "../queues/QueueMetricsManager"; // 🔹 Import corect pentru metrice
import EventBus from "../events/EventBus";

class InvitationWorker {
  private worker: Worker;

  constructor() {
    console.log("👷 Worker initialized, listening for jobs...");

    this.worker = new Worker(
      "invitationQueue",
      this.processJob.bind(this), // 🔹 Legăm `this` corect pentru a accesa metodele din clasă
      { connection: RedisConnection } // 🔹 Importăm direct instanța validă
    );

    this.setupEventListeners();
  }

  /**
   * ✅ Procesează fiecare job din coadă
   */
  private async processJob(job: Job) {
    console.log(`📨 Processing invitation for ${job.data.email}`);

    try {
      // Simulăm procesarea unui job
      if (Math.random() < 0.3) {
        throw new Error("Random failure for testing retries!"); // 🔹 Simulăm un eșec aleatoriu (30% din cazuri)
      }

      console.log(`✅ Invitation sent successfully to ${job.data.email}`);
      EventBus.emit("job:completed", { jobId: job.id, email: job.data.email });

    } catch (error) {
      console.error(`❌ Error sending invitation to ${job.data.email}:`, error);
      EventBus.emit("job:failed", { jobId: job.id, email: job.data.email, error });
      throw error; // 🔹 Aruncăm eroarea pentru a forța reîncercarea jobului
    }
  }

  /**
   * ✅ Setează listeneri pentru joburi finalizate și eșuate
   */
  private setupEventListeners() {
    this.worker.on("completed", async (job) => {
      if (job) {
        console.log(`✅ Job completed for ${job.data.email}`);
        await this.updateMetrics();
      }
    });

    this.worker.on("failed", async (job, err) => {
      if (job) {
        console.error(`❌ Job failed for ${job.data.email}:`, err);
        await this.updateMetrics();
      }
    });
  }

  /**
   * ✅ Actualizează metricele în sistem
   */
  private async updateMetrics() {
    await QueueMetricsManager.logQueueMetrics(); // 🔹 Folosim managerul de metrice corect
  }
}

// Exportăm o instanță unică a workerului
export default new InvitationWorker();