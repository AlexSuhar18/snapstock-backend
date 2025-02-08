import { Request, Response } from "express";
import { InvitationService } from "../services/InvitationService";
import { NotificationService } from "../services/NotificationService";
import { ValidationService } from "../services/ValidationService";
import asyncHandler from "../middlewares/asyncHandler";
import * as Sentry from "@sentry/node";
import { Invitation } from "../models/invitation";
import { UserService } from "../services/UserService"; // ✅ Import necesar pentru UserController

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
    
        const existingUser = await InvitationService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: `User with email ${email} already exists.` });
        }
    
        if (!ValidationService.isAllowedDomain(email)) {
            return res.status(400).json({ message: "Email domain not allowed." });
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
    
        try {
            let invitation = await InvitationService.getByToken(token);
        
            if (!invitation) {
                console.warn(`❌ Invitation not found for token: ${token}`);
                return res.status(404).json({ message: "Invalid or expired invitation" });
            }

            if (invitation.status === "revoked") {
                console.warn(`🚫 Invitation revoked: ${token}`);
                return res.status(403).json({ message: "This invitation has been revoked." });
            }

            const now = new Date();
            if (new Date(invitation.expiresAt) < now) {
                console.warn(`⌛ Invitation expired: ${token}`);
                await InvitationService.expireInvitations();
                return res.status(410).json({ message: "This invitation has expired." });
            }

            res.status(200).json({
                email: invitation.email,
                role: invitation.role,
                status: invitation.status,
                expiresAt: invitation.expiresAt,
            });

        } catch (error) {
            Sentry.captureException(error);
            console.error("❌ Error verifying invitation:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

    /**
     * ✅ Acceptare invitație și creare utilizator
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

        let invitation: Invitation | null = null;

        try {
            invitation = await InvitationService.getByToken(token);
        } catch (error) {
            Sentry.captureException(error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!invitation) {
            return res.status(404).json({ message: "Invalid or expired invitation" });
        }

        let userIp = req.headers["x-forwarded-for"];
        if (Array.isArray(userIp)) {
            userIp = userIp[0];
        }
        const userAgent = req.headers["user-agent"] || "Unknown";

        invitation.acceptedByIp = userIp as string || "Unknown";
        invitation.acceptedByDevice = userAgent;

        await InvitationService.updateInvitation(invitation);
        const newUser = await InvitationService.acceptInvite(invitation, fullName, password, req);
        await NotificationService.notifyAdmin(invitation);

        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });

    });

    /**
     * ✅ Retrimitere invitație cu generare token nou
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

        try {
            const invitation = await InvitationService.resendInvitation(email);
            if (!invitation) {
                return res.status(404).json({ message: "No pending invitation found." });
            }

            if (invitation.resendCount && invitation.resendCount >= 3) {
                return res.status(429).json({ message: "Invitation resend limit reached. Contact support for assistance." });
            }

            invitation.resendCount = (invitation.resendCount || 0) + 1;
            await InvitationService.updateInvitation(invitation);
            await NotificationService.sendInvitation(invitation);

            res.status(200).json({ 
                message: "Invitation resent successfully", 
                inviteToken: invitation.inviteToken 
            });
        } catch (error) {
            Sentry.captureException(error);
            console.error("❌ Error resending invitation:", error);
            res.status(500).json({ message: "Internal server error" });
        }
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

/**
 * ✅ Controller pentru gestionarea utilizatorilor
 */
export class UserController {
    static getUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    });
}