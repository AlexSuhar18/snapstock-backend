import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { InvitationService } from "../services/InvitationService";
import { NotificationService } from "../services/NotificationService";
import { ValidationService } from "../services/ValidationService";
import { Invitation } from "../models/invitation";
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: "SENTRY_DSN" });

/**
 * ✅ Controller pentru gestionarea invitațiilor
 */
export class InvitationController {
    /**
     * ✅ Trimitere invitație nouă
     */
    static sendInvite = asyncHandler(async (req: Request, res: Response) => {
        let { email, role, invitedBy, invitedByName, inviteMethod, phoneNumber } = req.body;
        email = req.body.email || req.params.email;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        
        if (!ValidationService.isAllowedDomain(email)) {
            return res.status(400).json({ message: "Email domain not allowed." });
        }

        const existingUser = await InvitationService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: `User with email ${email} already exists.` });
        }

        const invitation = await InvitationService.createInvitation(req.body);
        await NotificationService.sendInvitation(invitation);
        
        res.status(201).json({ message: "Invitation sent successfully", inviteToken: invitation.inviteToken });
    });

    /**
     * ✅ Verificare invitație
     */
    static verifyInvite = asyncHandler(async (req: Request, res: Response) => {
        const { token } = req.params;
        const invitation = await InvitationService.getByToken(token);
        
        if (!invitation) {
            return res.status(404).json({ message: "Invalid or expired invitation" });
        }
        
        if (invitation.status === "revoked") {
            return res.status(403).json({ message: "This invitation has been revoked." });
        }
        
        if (new Date(invitation.expiresAt) < new Date()) {
            await InvitationService.expireInvitations();
            return res.status(410).json({ message: "This invitation has expired." });
        }
        
        res.status(200).json(invitation);
    });
    
    /**
     * ✅ Acceptare invitație
     */
    static acceptInvite = asyncHandler(async (req: Request, res: Response) => {
        const { token } = req.params;
        const { fullName, password } = req.body;
        
        if (!fullName || !password) {
            return res.status(400).json({ message: "Missing required fields: fullName, password" });
        }
        
        if (!ValidationService.isStrongPassword(password)) {
            return res.status(400).json({ message: "Weak password. Please use a stronger password." });
        }
        
        const invitation = await InvitationService.getByToken(token);
        if (!invitation) {
            return res.status(404).json({ message: "Invalid or expired invitation" });
        }
        
        const newUser = await InvitationService.acceptInvite(invitation, fullName, password, req);
        await NotificationService.notifyAdmin(invitation);
        
        res.status(201).json({ message: "User registered successfully", user: newUser });
    });

    /**
     * ✅ Retrimitere invitație cu token nou
     */
    static resendInvite = asyncHandler(async (req: Request, res: Response) => {
        let { email } = req.body;
        email = email || req.params.email;
        
        if (!email) {
            return res.status(400).json({ message: "Missing required field: email" });
        }
        
        if (!ValidationService.isAllowedDomain(email)) {
            return res.status(400).json({ message: "Email domain not allowed." });
        }
        
        const invitation = await InvitationService.resendInvitation(email);
        if (!invitation) {
            return res.status(404).json({ message: "No pending invitation found." });
        }
        
        await NotificationService.sendInvitation(invitation);
        
        res.status(200).json({ message: "Invitation resent successfully", inviteToken: invitation.inviteToken });
    });
    
    /**
     * ✅ Anulare invitație
     */
    static cancelInvite = asyncHandler(async (req: Request, res: Response) => {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: "Missing invitation token" });
        }
        
        await InvitationService.revokeInvitation(token);
        
        res.status(200).json({ message: "Invitation revoked successfully" });
    });
    
    /**
     * ✅ Obține toate invitațiile
     */
    static getAllInvitations = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, pageSize = 10 } = req.query;
        
        const invitations = await InvitationService.getAllInvitations(Number(page), Number(pageSize));
        
        res.status(200).json(invitations);
    });
    
    /**
     * ✅ Obține dashboard invitații
     */
    static getInvitationsDashboard = asyncHandler(async (req: Request, res: Response) => {
        const dashboardData = await InvitationService.getInvitationsDashboard();
        res.status(200).json(dashboardData);
    });
}

export default InvitationController;
