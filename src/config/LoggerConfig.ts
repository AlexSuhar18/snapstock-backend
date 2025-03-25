import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

/**
 * ✅ Funcție pentru validarea nivelului de logging
 */
function validateLogLevel(level: string): "info" | "warn" | "error" | "debug" {
  const allowedLevels = ["info", "warn", "error", "debug"];
  return allowedLevels.includes(level) ? (level as "info" | "warn" | "error" | "debug") : "info";
}

/**
 * ✅ Configurația pentru LoggerService
 */
const LoggerConfig = {
  logLevel: validateLogLevel(process.env.LOG_LEVEL || "info"),
  logToFile: process.env.LOG_TO_FILE === "true",
  logToExternal: process.env.LOG_TO_EXTERNAL_SERVICE === "true",
  externalLogEndpoint: process.env.LOG_EXTERNAL_ENDPOINT || "http://log-server.com/logs",
  logJsonFormat: process.env.LOG_JSON === "true",
  logFilePath: path.join(__dirname, "..", "logs", "app.log"),
};

/**
 * ✅ Creează folderul pentru log-uri dacă nu există
 */
if (LoggerConfig.logToFile) {
  const logDir = path.dirname(LoggerConfig.logFilePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

export default LoggerConfig;
