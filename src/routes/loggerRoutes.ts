import { Router } from 'express';
import LoggerController from '../controllers/LoggerController';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';

const router = Router();

/**
 * ✅ Rute pentru logare centralizată
 * 🔹 Middleware-ul verifică dacă modulul 'logging' este activ
 */
router.post('/log', ModuleMiddleware.checkModule('logging'), LoggerController.logEvent);
router.post('/log/error', ModuleMiddleware.checkModule('logging'), LoggerController.logError);
router.post('/log/warn', ModuleMiddleware.checkModule('logging'), LoggerController.logWarn);
router.post('/log/debug', ModuleMiddleware.checkModule('logging'), LoggerController.logDebug);

export default router;
