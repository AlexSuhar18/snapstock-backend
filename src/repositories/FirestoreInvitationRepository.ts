import { adminDb } from "../config/firebase";
import { InvitationRepository } from "./InvitationRepository";
import { Invitation } from "../models/invitation";
import { Timestamp } from "firebase-admin/firestore";
import * as crypto from "crypto";
import admin from "firebase-admin";
import { NotificationService } from "../services/NotificationService";

export class FirestoreInvitationRepository implements InvitationRepository {
    async save(invitation: Invitation): Promise<void> {
        if (!invitation.createdAt || invitation.createdAt === "N/A") {
            invitation.createdAt = new Date().toISOString();
        }
    
        if (!invitation.expiresAt || invitation.expiresAt === "N/A") {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            invitation.expiresAt = expirationDate.toISOString();
        }
    
        await adminDb.collection("invitations").doc(invitation.inviteToken).set(invitation.toObject());
    }    

    async getByToken(token: string): Promise<Invitation | null> {
        const doc = await adminDb.collection("invitations").doc(token).get();
    
        if (!doc.exists) return null;
    
        console.log("📡 Raw invitation data from Firestore:", doc.data()); // DEBUGGING
    
        return new Invitation({ inviteToken: doc.id, ...doc.data() });
    }    

    async markAccepted(inviteToken: string): Promise<void> {
        const acceptedAt = Invitation.formatTimestamp(Timestamp.now(), "createdAt");

        await adminDb.collection("invitations").doc(inviteToken).update({
            status: "accepted",
            acceptedAt: acceptedAt,
        });
    }

    async markRevoked(inviteToken: string): Promise<void> {
        await adminDb.collection("invitations").doc(inviteToken).update({
            status: "revoked",
            revokedAt: admin.firestore.Timestamp.now(),
        });

        console.log(`❌ Invitation revoked for token: ${inviteToken}`);
    }

    async update(invitation: Invitation): Promise<void> {
        await adminDb.collection("invitations").doc(invitation.inviteToken).update(invitation.toObject());
    }

    /**
     * ✅ Trimite un reminder pentru invitațiile care expiră în curând.
     */
    async sendReminder(inviteToken: string): Promise<void> {
        const invitationDoc = await adminDb.collection("invitations").doc(inviteToken).get();
    
        if (!invitationDoc.exists) {
            console.log(`⚠️ No invitation found for token: ${inviteToken}`);
            return;
        }
    
        const invitation = new Invitation({ inviteToken: invitationDoc.id, ...invitationDoc.data() });
    
        if (invitation.reminderSent) {
            console.log(`🔔 Reminder already sent for ${invitation.email}`);
            return;
        }
    
        console.log(`📢 Sending reminder for invitation: ${invitation.email}`);
    
        // 🔹 Adăugăm schimbarea în changeLogs
        invitation.changeLogs?.push({
            date: new Date().toISOString(),
            field: "reminderSent",
            oldValue: invitation.reminderSent,
            newValue: true,
        });
    
        // 🔹 Trimitem notificarea prin email
        await NotificationService.sendReminderEmail(invitation.email, invitation.inviteToken);
    
        // 🔹 Actualizăm Firestore
        await adminDb.collection("invitations").doc(inviteToken).update({
            reminderSent: true,
            reminderSentAt: admin.firestore.Timestamp.now(),
            changeLogs: invitation.changeLogs, // 🔹 Salvăm log-ul în baza de date
        });
    
        console.log(`✅ Reminder sent for ${invitation.email}`);
    }    
    
    async resendInvitation(email: string): Promise<Invitation | null> {
        const invitationSnapshot = await adminDb
            .collection("invitations")
            .where("email", "==", email)
            .where("status", "==", "pending")
            .get();
    
        if (invitationSnapshot.empty) return null;
    
        const invitationDoc = invitationSnapshot.docs[0];
        const invitation = new Invitation({ id: invitationDoc.id, ...invitationDoc.data() });
    
        const oldToken = invitation.inviteToken;
        invitation.inviteToken = crypto.randomBytes(16).toString("hex");
    
        // 🔹 Creștem contorul pentru re-trimiteri
        invitation.resendCount = (invitation.resendCount || 0) + 1;
    
        // 🔹 Adăugăm schimbarea în changeLogs
        invitation.changeLogs?.push({
            date: new Date().toISOString(),
            field: "inviteToken",
            oldValue: oldToken,
            newValue: invitation.inviteToken,
        });
    
        await adminDb.collection("invitations").doc(invitationDoc.id).update({
            inviteToken: invitation.inviteToken,
            resendCount: invitation.resendCount, // ✅ Salvăm noul `resendCount`
            emailSentAt: new Date(),
            changeLogs: invitation.changeLogs,
        });
    
        return invitation;
    }    

    async incrementFailedAttempts(inviteToken: string): Promise<void> {
        const invitationRef = adminDb.collection("invitations").doc(inviteToken);
        const doc = await invitationRef.get();
    
        if (!doc.exists) return;
    
        const invitation = doc.data() as Invitation;
        const newFailedAttempts = (invitation.failedAttempts ?? 0) + 1;
    
        if (newFailedAttempts >= 5) {
            // ✅ Revocăm invitația după 5 încercări eșuate
            await invitationRef.update({
                status: "revoked",
                failedAttempts: newFailedAttempts,
                revokedAt: admin.firestore.Timestamp.now(),
            });
            console.log(`❌ Invitation revoked after 5 failed attempts: ${inviteToken}`);
        } else {
            await invitationRef.update({
                failedAttempts: newFailedAttempts,
            });
            console.log(`⚠️ Failed attempt ${newFailedAttempts} for ${inviteToken}`);
        }
    } 
    
    async getByEmail(email: string): Promise<Invitation | null> {
        const snapshot = await adminDb
            .collection("invitations")
            .where("email", "==", email)
            .where("status", "==", "pending") // Ne asigurăm că luăm doar invitațiile active
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return new Invitation({ inviteToken: doc.id, ...doc.data() });
    }
    
}
