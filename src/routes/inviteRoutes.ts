import express from "express";
import { InvitationController } from "../controllers/inviteController";
import { inviteLimiter, generalLimiter } from "../config/RateLimiter";

const router = express.Router();

// ✅ Aplicăm limitarea doar pe trimiterea/resend invitații
router.post("/invite", inviteLimiter, InvitationController.sendInvite);
router.post("/resend-invite/:email", inviteLimiter, InvitationController.resendInvite);
router.post("/accept-invite/:token", InvitationController.acceptInvite);

router.use(generalLimiter);

// ✅ Restul rutelor fără limitare
router.get("/verify-invite/:token", InvitationController.verifyInvite);
router.post("/cancel-invite/:token", InvitationController.cancelInvite);
router.get("/invitations", InvitationController.getAllInvitations);
router.get("/invitations-dashboard", InvitationController.getInvitationsDashboard);

export default router;
