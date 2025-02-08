import express from "express";
import dotenv from "dotenv";
import stocksRoutes from "./routes/stocksRoutes";
import superuserRoutes from "./routes/superuserRoutes";
import inviteRoutes from "./routes/inviteRoutes";
import DebugRoutes from "./routes/DebugRoutes";
import LoggingMiddleware from "./middlewares/loggingMiddleware";
import LoggerService from "./services/LoggerService";
import EventBus from "./events/EventBus";

// ✅ Încărcăm variabilele de mediu O SINGURĂ DATĂ
dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

LoggerService.logInfo("✅ ENV LOADED");
LoggerService.logInfo(`NODE_ENV: ${process.env.NODE_ENV}`);
LoggerService.logInfo(`ALLOWED_DOMAINS: "${process.env.ALLOWED_DOMAINS}"`);

const app = express();

try {
  // ✅ Middleware pentru logarea request-urilor
  app.use(LoggingMiddleware.requestLogger);

  // ✅ Middleware pentru parsing JSON
  app.use(express.json());

  // ✅ Definim rutele aplicației
  app.use("/api", stocksRoutes);
  app.use("/admin", superuserRoutes);
  app.use("/api/users", inviteRoutes);
  app.use("/api/debug", DebugRoutes);

  // ✅ Răspuns pentru ruta principală
  app.get("/", (req, res) => {
    res.send("🚀 Server is running!");
  });

  // ✅ Middleware pentru gestionarea erorilor
  app.use(LoggingMiddleware.errorLogger);

  // ✅ Inițializăm EventBus (pentru logare evenimente, job-uri etc.)
  EventBus.emit("server:started", { port: process.env.PORT || 3000 });

  // ✅ Pornim serverul
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    LoggerService.logInfo(`🚀 Serverul rulează pe portul ${PORT}`);
  });
} catch (error) {
  LoggerService.logError("❌ Fatal error on startup:", error);
  process.exit(1); // Închidem aplicația în caz de eroare critică
}
