import rateLimit from "express-rate-limit";

/**
 * ✅ Limitează cererile pentru invitații
 */
export const inviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5, // Max 5 cereri per IP
  message: "Too many invites sent from this IP, please try again later.",
  standardHeaders: true, // ✅ Activează `RateLimit-*` headers în răspuns
  legacyHeaders: false, // ❌ Dezactivează `X-RateLimit-*` headers vechi
});

/**
 * ✅ Limitare generală pentru API
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 oră
  max: 100, // Max 100 cereri per IP
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
