import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';

const router = Router();

// ✅ Middleware global pentru acest modul
router.use(ModuleMiddleware.checkModule('notifications'));

// 🔹 Rute pentru notificări (folosind metodele corect)
router.post('/send-invitation', (req, res, next) => NotificationController.sendInvitation(req, res, next));
router.post('/notify-admin', (req, res, next) => NotificationController.notifyAdmin(req, res, next));
router.post('/send-reminder', (req, res, next) => NotificationController.sendReminderEmail(req, res, next));

export default router;
