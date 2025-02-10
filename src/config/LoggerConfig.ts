import dotenv from "dotenv";

dotenv.config();

/**
 * ✅ Configurația pentru LoggerService
 */
const LoggerConfig = {
  logLevel: process.env.LOG_LEVEL || "info",
  logToFile: process.env.LOG_TO_FILE === "true",
  logToExternal: process.env.LOG_TO_EXTERNAL_SERVICE === "true",
  externalLogEndpoint: process.env.LOG_EXTERNAL_ENDPOINT || "http://log-server.com/logs"
};

export default LoggerConfig;
