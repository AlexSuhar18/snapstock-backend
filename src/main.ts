import express from "express";
import dotenv from "dotenv";
import stocksRoutes from "./routes/stocksRoutes";
import superuserRoutes from "./routes/superuserRoutes";
import inviteRoutes from "./routes/inviteRoutes";
import DebugRoutes from "./routes/DebugRoutes";
import LoggingMiddleware from "./middlewares/loggingMiddleware";
import LoggerService from "./services/LoggerService";
import EventBus from "./events/EventBus";

// ✅ Încărcăm variabilele de mediu
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

/**
 * ✅ Validare variabile esențiale
 */
const REQUIRED_ENV_VARS = ["PORT", "ALLOWED_DOMAINS"];

REQUIRED_ENV_VARS.forEach((envVar) => {
  if (!process.env[envVar]) {
    LoggerService.logError(`❌ Missing environment variable: ${envVar}`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;
const app = express();

try {
  LoggerService.logInfo("✅ Initializing application...");

  // ✅ Middleware-uri
  app.use(LoggingMiddleware.requestLogger);
  app.use(express.json());

  // ✅ Definim rutele aplicației
  app.use("/api", stocksRoutes);
  app.use("/admin", superuserRoutes);
  app.use("/api/users", inviteRoutes);
  app.use("/api/debug", DebugRoutes);

  // ✅ Ruta principală
  app.get("/", (req, res) => {
    res.send("🚀 Server is running!");
  });

  // ✅ Middleware pentru erori
  app.use(LoggingMiddleware.errorLogger);

  // ✅ Inițializăm EventBus (gestionare evenimente)
  try {
    EventBus.emit("server:started", { port: PORT });
    LoggerService.logInfo("✅ EventBus initialized.");
  } catch (eventBusError) {
    LoggerService.logError("❌ Error initializing EventBus:", eventBusError);
  }

  // ✅ Pornim serverul
  const server = app.listen(PORT, () => {
    LoggerService.logInfo(`🚀 Server running on port ${PORT}`);
  });

  /**
   * ✅ Gestionare shutdown controlat
   */
  const gracefulShutdown = () => {
    LoggerService.logInfo("⚠️ Shutting down server...");

    server.close(() => {
      LoggerService.logInfo("✅ Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
} catch (error) {
  LoggerService.logError("❌ Fatal error on startup:", error);
  process.exit(1); // Închidem aplicația în caz de eroare critică
}
