import { inviteLimiter, generalLimiter } from '../config/RateLimiter'; // ✅ Import corect
import EventService from '../services/EventService';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';
import { EventTypes } from '../events/EventTypes';
import rateLimit from "express-rate-limit";
import LoggerService from "../services/LoggerService";

class RateLimitService {
  /**
   * ✅ Creează un rate limiter pe baza unei configurații, verificând dacă modulul este activ
   */
  public static createRateLimiter(options: {
    windowMs: number;
    max: number;
    message: string;
  }) {
    try {
      ModuleMiddleware.ensureModuleActive('rateLimiter');

      const limiter = rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        message: options.message,
        standardHeaders: true,
        legacyHeaders: false,
      });

      EventService.emitEvent(EventTypes.RATE_LIMITER_CREATED, {
        windowMs: options.windowMs,
        max: options.max,
      });

      LoggerService.logInfo(`✅ Rate limiter created: ${options.max} requests per ${options.windowMs}ms`);
      
      return limiter;
    } catch (error) {
      LoggerService.logError("❌ Error creating rate limiter", error);

      EventService.emitEvent(EventTypes.RATE_LIMITER_FAILED, {
        error: error instanceof Error ? error.message : String(error),
      });
      

      return { success: false, message: "❌ Rate Limiter module is disabled or an error occurred." };
    }
  }
}

// ✅ Exportă direct limitatoarele din config (nu le trece prin createRateLimiter)
export { inviteLimiter, generalLimiter };

export default RateLimitService;
