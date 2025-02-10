import express from "express";
import dotenv from "dotenv";
import configureMiddleware from "./config/MiddlewareConfig";
import configureEventBus from "./config/EventBusConfig";
import logger from "./services/LoggerService";
import RedisConnection from "./config/RedisConnection";
import MonitoringService from "./services/MonitoringService";
import ErrorHandlingMiddleware from "./middlewares/ErrorHandlingMiddleware";
import stocksRoutes from "./routes/stocksRoutes";
import superuserRoutes from "./routes/superuserRoutes";
import inviteRoutes from "./routes/inviteRoutes";
import DebugRoutes from "./routes/DebugRoutes";

// ✅ Încărcăm variabilele de mediu O SINGURĂ DATĂ
dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

console.log("✅ ENV LOADED");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("ALLOWED_DOMAINS:", `"${process.env.ALLOWED_DOMAINS}"`);

const app = express();

// ✅ Configurăm middleware-urile
configureMiddleware(app);

// ✅ Definim rutele aplicației
app.use("/api", stocksRoutes);
app.use("/admin", superuserRoutes);
app.use("/api/users", inviteRoutes);
app.use("/api/debug", DebugRoutes);

// ✅ Adăugăm middleware pentru gestionarea erorilor
app.use(ErrorHandlingMiddleware.handleErrors);

// ✅ Răspuns pentru ruta principală
app.get("/", (req, res) => {
    logger.logInfo("🏠 Home route accessed.");
    res.send("🚀 Server is running!");
});

// ✅ Funcție asincronă pentru a inițializa Redis și EventBus
const initServer = async () => {
    try {
        const redisClient = RedisConnection.getInstance();
        await redisClient.ping(); // Verificăm conexiunea la Redis
        logger.logInfo("🔗 Redis connected successfully.");
        configureEventBus();
        MonitoringService.sendLog("server_started", { timestamp: new Date() });
    } catch (error: unknown) {
        logger.logError("❌ Redis connection failed:", error);
        process.exit(1);
    }
};

// ✅ Pornim serverul
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.logInfo(`🚀 Serverul rulează pe portul ${PORT}`);
    MonitoringService.sendLog("server_running", { port: PORT });
});

// ✅ Gestionăm shutdown-ul corect
process.on("SIGINT", async () => {
    logger.logInfo("🔻 Graceful shutdown initiated...");
    try {
        const redisClient = RedisConnection.getInstance();
        await redisClient.quit();
        server.close(() => {
            logger.logInfo("✅ Server stopped cleanly.");
            MonitoringService.sendLog("server_shutdown", { reason: "SIGINT" });
            process.exit(0);
        });
    } catch (error: unknown) {
        logger.logError("❌ Error during shutdown:", error);
        process.exit(1);
    }
});

process.on("uncaughtException", (err: Error) => {
    logger.logError("🔥 Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<any>) => {
    logger.logError("🚨 Unhandled Promise Rejection:", { reason, promise });
});

// ✅ Inițializăm Redis și EventBus
initServer();