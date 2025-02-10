import rateLimit from "express-rate-limit";
import RateLimitConfig from "../config/RateLimiter";

class RateLimitService {
  /**
   * ✅ Creează un rate limiter pe baza unei configurații
   */
  public static createRateLimiter(options: {
    windowMs: number;
    max: number;
    message: string;
  }) {
    return rateLimit({
      windowMs: options.windowMs,
      max: options.max,
      message: options.message,
      standardHeaders: true, // ✅ Activează rate limiting în headerele standard
      legacyHeaders: false,  // ✅ Dezactivează headerele vechi depășite
    });
  }
}

// 🔹 Exportăm instanțe concrete de rate limiter
export const inviteLimiter = RateLimitService.createRateLimiter(RateLimitConfig.invite);
export const generalLimiter = RateLimitService.createRateLimiter(RateLimitConfig.general);

export default RateLimitService;
