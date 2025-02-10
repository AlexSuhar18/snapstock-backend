import express from "express";
import LoggingMiddleware from "../middlewares/loggingMiddleware";
import RateLimitConfig from "./RateLimiter";
import corsConfig from "./CorsConfig";
import helmetConfig from "./HelmetConfig";

export default function configureMiddleware(app: express.Application) {
    app.use(helmetConfig); // 🔹 Securitate HTTP Headers
    app.use(corsConfig); // 🔹 Configurare CORS

    app.use(LoggingMiddleware.requestLogger); // 🔹 Middleware pentru logare request-uri

    // 🔹 Limitare rată pentru invitații și API în general
    app.use("/api/users", RateLimitConfig.inviteLimiter);
    app.use(RateLimitConfig.generalLimiter);

    app.use(express.json()); // 🔹 Middleware pentru JSON handling
    app.use(LoggingMiddleware.errorLogger); // 🔹 Middleware pentru gestionarea erorilor
}
