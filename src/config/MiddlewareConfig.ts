import express from "express";
import LoggingMiddleware from "../middlewares/loggingMiddleware";
import { inviteLimiter, generalLimiter } from "./RateLimiter"; // Import corect
import corsConfig from "./CorsConfig";
import helmetConfig from "./HelmetConfig";
import LoggerService from "../services/LoggerService";
import dotenv from "dotenv";

dotenv.config();

/**
 * ✅ Middleware-urile disponibile și activabile din .env
 */
const middlewareConfig = {
  cors: process.env.ENABLE_CORS === "true",
  rateLimit: process.env.ENABLE_RATE_LIMIT === "true",
  logging: process.env.ENABLE_LOGGING === "true",
  jsonParser: process.env.ENABLE_JSON_PARSER === "true",
};

/**
 * ✅ Configurează middleware-urile Express
 */
export default function configureMiddleware(app: express.Application) {
  LoggerService.logInfo("🚀 Initializing middleware...");

  if (middlewareConfig.cors) {
    app.use(corsConfig);
    LoggerService.logInfo("✅ CORS middleware enabled.");
  }

  app.use(helmetConfig);
  LoggerService.logInfo("✅ Helmet middleware enabled for security headers.");

  if (middlewareConfig.logging) {
    app.use(LoggingMiddleware.requestLogger);
    LoggerService.logInfo("✅ Logging middleware enabled.");
  }

  if (middlewareConfig.rateLimit) {
    app.use("/api/users", inviteLimiter);
    app.use(generalLimiter);
    LoggerService.logInfo("✅ Rate limiter middleware enabled (using express-rate-limit).");
  }

  if (middlewareConfig.jsonParser) {
    app.use(express.json());
    LoggerService.logInfo("✅ JSON parser middleware enabled.");
  }

  app.use(LoggingMiddleware.errorLogger);
  LoggerService.logInfo("✅ Error logging middleware enabled.");

  LoggerService.logInfo("🚀 Middleware initialized successfully.");
}
