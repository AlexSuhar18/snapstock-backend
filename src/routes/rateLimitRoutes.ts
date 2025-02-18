import { Router } from 'express';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';
import { inviteLimiter, generalLimiter } from '../services/RateLimiterService';

const router = Router();

// ✅ Middleware global pentru verificare modul activ
router.use(ModuleMiddleware.checkModule('rateLimiter'));

// 🔹 Aplica rate limiter pe rute specifice
router.use('/invites', inviteLimiter);
router.use('/general', generalLimiter);

export default router;
