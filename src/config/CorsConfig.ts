import cors from "cors";
import LoggerService from "../services/LoggerService";

/**
 * ✅ Configurare CORS centralizată cu validare și logging
 */
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = allowedOriginsEnv ? allowedOriginsEnv.split(",").map(origin => origin.trim()) : [];

if (allowedOrigins.length === 0) {
    LoggerService.logWarn("⚠️ No CORS origins specified. Defaulting to '*'. This is not recommended in production.");
}

/**
 * 🔥 Opțiuni CORS îmbunătățite cu validare
 */
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            LoggerService.logWarn(`❌ CORS Policy: Access blocked for origin '${origin}'`);
            callback(new Error("CORS Policy: This origin is not allowed"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

// 🔍 Loghează lista originilor permise pentru debugging
LoggerService.logInfo(`✅ Allowed CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(", ") : "*"}`);

export default cors(corsOptions);
