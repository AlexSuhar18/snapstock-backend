import rateLimit from "express-rate-limit";

/**
 * ✅ Configurare rate limit pentru diferite categorii de request-uri
 */
const RateLimitConfig = {
    inviteLimiter: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minute
        max: 5, // Max 5 invitații per IP
        message: "Too many invite requests. Please try again later."
    }),

    generalLimiter: rateLimit({
        windowMs: 60 * 1000, // 1 minut
        max: 100, // Max 100 request-uri pe minut per IP
        message: "Too many requests. Please slow down."
    })
};

export default RateLimitConfig;
