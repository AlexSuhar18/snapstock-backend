import express from "express";
import NotificationController from "../controllers/NotificationController";
import ValidateNotificationMiddleware from "../middlewares/validateNotificationMiddleware";

const router = express.Router();

router.post("/send-invitation", ValidateNotificationMiddleware.validateSendInvitation, NotificationController.sendInvitation);
router.post("/notify-admin", ValidateNotificationMiddleware.validateNotifyAdmin, NotificationController.notifyAdmin);
router.post("/send-reminder", ValidateNotificationMiddleware.validateSendReminder, NotificationController.sendReminderEmail);

export default router;
