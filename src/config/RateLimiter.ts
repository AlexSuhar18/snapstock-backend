import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

/**
 * ✅ Clasă pentru gestionarea Rate Limiting
 * 🔹 Permite configurarea dinamică a limitării în funcție de endpoint.
 */
class RateLimitConfig {
  public static createLimiter(
    maxRequests: number,
    minutes: number,
    message: string
  ): RateLimitRequestHandler {
    return rateLimit({
      windowMs: minutes * 60 * 1000, // 🔹 Convertim minutele în milisecunde
      max: maxRequests, // 🔹 Numărul maxim de cereri pe fereastra de timp
      message,
    });
  }
}

// ✅ Limitator specific pentru trimiterea invitațiilor
export const inviteLimiter = RateLimitConfig.createLimiter(
  5, // Max 5 invitații
  15, // Într-o fereastră de 15 minute
  "Too many invite requests. Please try again later."
);

// ✅ Limitator generic pentru alte endpoint-uri
export const generalLimiter = RateLimitConfig.createLimiter(
  100, // Max 100 request-uri
  10, // Într-o fereastră de 10 minute
  "Too many requests. Please try again later."
);

export default RateLimitConfig;
