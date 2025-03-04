import express from "express";
import InviteController from "../controllers/inviteController";
import ValidateInviteMiddleware from "../middlewares/validateInviteMiddleware";

const router = express.Router();

router.post("/send", ValidateInviteMiddleware.validateSendInvite, InviteController.sendInvite);
router.get("/verify/:token", InviteController.verifyInvite);
router.post("/accept", ValidateInviteMiddleware.validateAcceptInvite, InviteController.acceptInvite);
router.post("/resend/:email", InviteController.resendInvite);
router.delete("/cancel/:token", InviteController.cancelInvite);
router.get("/all", InviteController.getAllInvitations);
router.post("/expire", InviteController.expireInvitations);

export default router;
