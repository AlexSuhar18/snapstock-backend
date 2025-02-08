import QueueManager from "./QueueManager";

class QueueMetricsManager {
  public static async logQueueMetrics(): Promise<void> {
    const queue = QueueManager.getQueue(); // 🔹 Acum accesăm corect coada

    const waiting = await queue.getWaitingCount();
    const active = await queue.getActiveCount();
    const completed = await queue.getCompletedCount();
    const failed = await queue.getFailedCount();
    const delayed = await queue.getDelayedCount();

    console.log("📊 Queue Metrics:");
    console.log(`⏳ Waiting: ${waiting}`);
    console.log(`🚀 Active: ${active}`);
    console.log(`✅ Completed: ${completed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏰ Delayed: ${delayed}`);
  }
}

export default QueueMetricsManager;
