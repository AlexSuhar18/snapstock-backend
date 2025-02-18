import express from "express";
import InviteController from "../controllers/InviteController";
import { inviteLimiter, generalLimiter } from "../config/RateLimiter";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";

const router = express.Router();

// ✅ Aplicăm middleware DOAR pe rutele relevante
router.post("/send", ModuleMiddleware.checkModule('invitations'), inviteLimiter, InviteController.sendInvite);
router.post("/resend/:email", ModuleMiddleware.checkModule('invitations'), inviteLimiter, InviteController.resendInvite);
router.post("/accept", ModuleMiddleware.checkModule('invitations'), InviteController.acceptInvite);
router.get("/verify/:token", InviteController.verifyInvite);
router.post("/cancel/:token", ModuleMiddleware.checkModule('invitations'), InviteController.cancelInvite);
router.get("/all", InviteController.getAllInvitations);
router.post("/expire", InviteController.expireInvitations);

export default router;
