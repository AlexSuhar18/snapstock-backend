import LoggerConfig from "../config/LoggerConfig";

/**
 * ✅ Serviciu pentru logare externă (ex: DataDog, Sentry, LogServer)
 */
class MonitoringService {
  public static sendLog(eventName: string, details?: any) {
    if (!LoggerConfig.logToExternal) return;

    fetch(LoggerConfig.externalLogEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: eventName, details })
    }).catch((err) => console.error("❌ Failed to send log to external service:", err));
  }
}

export default MonitoringService;
