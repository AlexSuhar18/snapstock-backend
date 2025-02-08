import { adminDb } from "../config/firebase";
import { Invitation } from "../models/invitation";
import { FirestoreInvitationRepository } from "../repositories/FirestoreInvitationRepository";
import { InvitationRepository } from "../repositories/InvitationRepository";
import { generateUsername } from "../utils/usernameUtils";
import * as crypto from "crypto";
import { Request } from "express";
import axios from "axios";
import { GeoLocationResponse } from "../types";
import { InvitationData } from "../types";
import { NotificationService } from "./NotificationService";
import admin from "firebase-admin";
import * as Sentry from "@sentry/node";
import { ValidationService } from "./ValidationService";
import bcrypt from "bcrypt";
import invitationQueue from "../queues/InvitationQueueManager";

Sentry.init({ dsn: "SENTRY_DSN" });

export class InvitationService {
  private static invitationRepository: InvitationRepository =
    new FirestoreInvitationRepository();

  /**
   * ✅ Creează și salvează o invitație nouă
   */
  static async createInvitation(data: any): Promise<Invitation> {
    try {
      // 🔹 Căutăm invitația existentă
      let existingInvitation = await this.invitationRepository.getByEmail(
        data.email
      );

      if (existingInvitation) {
        if (existingInvitation.status === "pending") {
          console.log(
            `🔄 Invitation already exists for ${data.email}. Resending...`
          );

          // ✅ Generăm un nou token doar dacă trebuie
          let newInviteToken;
          do {
            newInviteToken = crypto.randomBytes(16).toString("hex");
          } while (await InvitationService.tokenExists(newInviteToken));

          // 🔹 Actualizăm invitația existentă cu noul token și data trimiterii
          const invitationRef = adminDb
            .collection("invitations")
            .doc(existingInvitation.inviteToken);
          await invitationRef.update({
            inviteToken: newInviteToken,
            emailSentAt: new Date().toISOString(),
            changeLogs: admin.firestore.FieldValue.arrayUnion({
              date: new Date().toISOString(),
              field: "inviteToken",
              oldValue: existingInvitation.inviteToken,
              newValue: newInviteToken,
            }),
          });

          // ✅ Actualizăm obiectul local
          existingInvitation.inviteToken = newInviteToken;
          existingInvitation.emailSentAt = new Date().toISOString();

          // 🔹 Adăugăm job-ul în queue
          await invitationQueue.addJob("send-invitation", {
            email: existingInvitation.email,
            inviteToken: existingInvitation.inviteToken,
            role: existingInvitation.role,
            expiresAt: existingInvitation.expiresAt,
          });

          return existingInvitation;
        }
      }

      // 🔹 Dacă nu există o invitație, creăm una nouă
      if (!data.inviteToken) {
        data.inviteToken = crypto.randomBytes(16).toString("hex");
      }

      // 🔹 Setăm data de expirare (ex: 7 zile de la creare)
      if (!data.expiresAt) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        data.expiresAt = expirationDate.toISOString();
      }

      const invitation = new Invitation(data);

      console.log("📩 Creating new invitation:", {
        token: invitation.inviteToken,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      });

      await this.invitationRepository.save(invitation);

      // 🔹 Adăugăm job-ul în queue în loc să blocăm execuția API-ului
      await invitationQueue.addJob("send-invitation", {
        email: invitation.email,
        inviteToken: invitation.inviteToken,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      });

      return invitation;
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error creating invitation:", error);

      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(
          "An unexpected error occurred while creating the invitation."
        );
      }
    }
  }

  /**
   * ✅ Obține o invitație după token
   */
  static async getByToken(token: string): Promise<Invitation | null> {
    try {
      return await this.invitationRepository.getByToken(token);
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error retrieving invitation by token:", error);
      throw new Error("Error retrieving invitation by token");
    }
  }

  /**
   * ✅ Acceptă o invitație și creează utilizatorul
   */
  static async acceptInvite(
    invitation: Invitation,
    fullName: string,
    password: string,
    req: Request
  ): Promise<any> {
    try {
      const batch = adminDb.batch();

      // ✅ Inițializăm numărul de încercări și verificăm limitele
      invitation.attemptsMade = invitation.attemptsMade ?? 0;
      invitation.failedAttempts = invitation.failedAttempts ?? 0;
      invitation.maxAttempts = invitation.maxAttempts ?? 5;

      if (invitation.status === "accepted") {
        throw new Error("✅ This invitation has already been accepted.");
      }

      if (invitation.status === "revoked") {
        throw new Error("🚫 This invitation has been revoked.");
      }

      // ✅ 1️⃣ Verificăm dacă utilizatorul a depășit numărul maxim de încercări
      if (invitation.failedAttempts >= invitation.maxAttempts) {
        await this.invitationRepository.markRevoked(invitation.inviteToken);
        throw new Error(
          "❌ This invitation has been revoked due to too many failed attempts."
        );
      }

      // ✅ 2️⃣ Verificăm dacă utilizatorul a introdus o parolă validă
      if (!password || !ValidationService.isStrongPassword(password)) {
        console.log(
          `⚠️ Invalid password attempt for invitation: ${invitation.inviteToken}`
        );

        // ❌ Creștem numărul de încercări eșuate
        invitation.failedAttempts += 1;
        await this.invitationRepository.incrementFailedAttempts(
          invitation.inviteToken
        );

        if (invitation.failedAttempts >= invitation.maxAttempts) {
          console.log(
            `🚫 Revoking invitation ${invitation.inviteToken} due to too many failed attempts.`
          );
          await this.invitationRepository.markRevoked(invitation.inviteToken);
          throw new Error(
            "❌ Too many failed attempts. This invitation is now revoked."
          );
        }

        throw new Error(
          "❌ Invalid password. Please try again with a stronger password."
        );
      }

      // ✅ 3️⃣ Hash-uim parola înainte de a o salva
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ 4️⃣ Dacă parola este validă, resetăm încercările eșuate și continuăm
      invitation.failedAttempts = 0;
      invitation.attemptsMade += 1;
      invitation.lastAttemptAt = new Date().toISOString();

      const invitationRef = adminDb
        .collection("invitations")
        .doc(invitation.inviteToken);
      batch.update(invitationRef, {
        attemptsMade: invitation.attemptsMade,
        failedAttempts: invitation.failedAttempts, // Resetăm încercările eșuate
        lastAttemptAt: invitation.lastAttemptAt,
      });

      // ✅ 5️⃣ Verificăm dacă utilizatorul există deja
      const userExists = await this.getUserByEmail(invitation.email);
      if (userExists) {
        throw new Error("🚫 A user with this email already exists.");
      }

      // 🔹 **Geolocalizare - Capturăm IP-ul utilizatorului**
      let userIp =
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        "Unknown";
      if (userIp.includes(",")) {
        userIp = userIp.split(",")[0].trim();
      }

      let locationData = {
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        lat: null as number | null,
        lon: null as number | null,
      };

      try {
        const geoResponse = await axios.get<GeoLocationResponse>(
          `http://ip-api.com/json/${userIp}`,
          { timeout: 5000 }
        );

        if (geoResponse.data?.status === "success") {
          locationData = {
            country: geoResponse.data.country,
            region: geoResponse.data.regionName,
            city: geoResponse.data.city,
            lat: geoResponse.data.lat,
            lon: geoResponse.data.lon,
          };
        } else {
          console.warn("🌍 Geolocation API returned failure status.");
        }
      } catch (err) {
        console.warn("🌍 Geolocation lookup failed:", err);
        Sentry.captureException(err);
      }

      // ✅ 6️⃣ Generăm un username
      const [firstName, lastName] = fullName.split(" ");
      const username = await generateUsername(
        invitation.email,
        firstName,
        lastName
      );

      // ✅ 7️⃣ Creăm utilizatorul în Firestore
      const userRef = adminDb.collection("users").doc();
      const newUser = {
        id: userRef.id,
        email: invitation.email,
        username,
        fullName,
        role: invitation.role,
        password: hashedPassword, // 🔹 Salvăm parola hash-uită
        createdAt: new Date(),
        acceptedByIp: userIp,
        acceptedFromLocation: locationData,
      };
      batch.set(userRef, newUser);

      // ✅ 8️⃣ Salvăm geolocația în invitație și logăm schimbarea
      invitation.acceptedFromLocation = `${locationData.city}, ${locationData.region}, ${locationData.country}`;

      invitation.changeLogs?.push({
        date: new Date().toISOString(),
        field: "acceptedFromLocation",
        oldValue: "N/A",
        newValue: invitation.acceptedFromLocation,
      });

      batch.update(invitationRef, {
        acceptedFromLocation: invitation.acceptedFromLocation,
        changeLogs: admin.firestore.FieldValue.arrayUnion(
          invitation.changeLogs?.slice(-1)[0]
        ),
      });

      await batch.commit();
      await this.invitationRepository.markAccepted(invitation.inviteToken);

      return newUser;
    } catch (error) {
      // ✅ 9️⃣ Dacă eșuează autentificarea, creștem numărul de încercări eșuate
      await this.invitationRepository.incrementFailedAttempts(
        invitation.inviteToken
      );

      Sentry.captureException(error);
      console.error("❌ Error accepting invitation:", error);
      throw new Error("Error accepting invitation");
    }
  }
  /**
   * ✅ Retrimite invitația și generează un nou token
   */
  static async resendInvitation(email: string): Promise<Invitation | null> {
    try {
      // 🔹 Căutăm invitația existentă în Firestore
      const invitationSnapshot = await adminDb
        .collection("invitations")
        .where("email", "==", email)
        .where("status", "==", "pending")
        .get();

      if (invitationSnapshot.empty) return null;

      const invitationDoc = invitationSnapshot.docs[0];
      const invitation = new Invitation({
        id: invitationDoc.id,
        ...invitationDoc.data(),
      });

      // 🔹 Generăm un nou token unic și verificăm să nu existe deja în baza de date
      let newInviteToken;
      do {
        newInviteToken = crypto.randomBytes(16).toString("hex");
      } while (await InvitationService.tokenExists(newInviteToken));

      // 🔹 Evităm trimiterea aceluiași token vechi
      if (invitation.inviteToken === newInviteToken) {
        console.warn(
          "⚠️ Generated token is identical to the existing one. Generating a new token..."
        );
        do {
          newInviteToken = crypto.randomBytes(16).toString("hex");
        } while (await InvitationService.tokenExists(newInviteToken));
      }

      // 🔹 Actualizăm obiectul invitation cu noul token
      invitation.inviteToken = newInviteToken;
      invitation.emailSentAt = new Date().toISOString();

      // 🔹 Actualizăm invitația în Firestore
      const batch = adminDb.batch();
      const invitationRef = adminDb
        .collection("invitations")
        .doc(invitationDoc.id);

      batch.update(invitationRef, {
        inviteToken: newInviteToken,
        emailSentAt: invitation.emailSentAt,
        changeLogs: admin.firestore.FieldValue.arrayUnion({
          date: new Date().toISOString(),
          field: "inviteToken",
          oldValue: invitation.inviteToken,
          newValue: newInviteToken,
        }),
      });

      await batch.commit();

      // 🔹 Re-trimitere invitație prin email/SMS **cu noul token**
      await NotificationService.sendInvitation(invitation);

      console.log(
        `🔄 Invitation token regenerated and sent to ${email}: ${newInviteToken}`
      );

      return invitation;
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error resending invitation:", error);
      throw new Error("Error resending invitation");
    }
  }

  /**
   * ✅ Actualizează invitația în Firestore
   */
  static async updateInvitation(invitation: Invitation): Promise<void> {
    try {
      const batch = adminDb.batch();
      const invitationRef = adminDb
        .collection("invitations")
        .doc(invitation.inviteToken);

      batch.update(invitationRef, {
        acceptedByIp: invitation.acceptedByIp || null,
        acceptedByDevice: invitation.acceptedByDevice || null,
        acceptedFromLocation: invitation.acceptedFromLocation || null,
        acceptedAt: new Date().toISOString(),
        status: "accepted",
      });

      await batch.commit();

      console.log(
        `✅ Invitation ${invitation.inviteToken} updated successfully.`
      );
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error updating invitation:", error);
      throw new Error("Error updating invitation");
    }
  }

  /**
   * ✅ Verifică dacă un token există deja în baza de date.
   */
  static async tokenExists(token: string): Promise<boolean> {
    try {
      const snapshot = await adminDb
        .collection("invitations")
        .where("inviteToken", "==", token)
        .get();
      return !snapshot.empty;
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error checking token existence:", error);
      throw new Error("Error checking token existence");
    }
  }

  /**
   * ✅ Revocă o invitație
   */
  static async revokeInvitation(token: string): Promise<void> {
    try {
      const invitation = await this.invitationRepository.getByToken(token);
      if (invitation) {
        await this.invitationRepository.markRevoked(invitation.inviteToken);
        console.log(`✅ Invitation ${token} has been revoked.`);
      }
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error revoking invitation:", error);
      throw new Error("Error revoking invitation");
    }
  }

  /**
   * ✅ Verifică dacă un utilizator există deja în baza de date
   */
  static async getUserByEmail(email: string | undefined): Promise<boolean> {
    try {
      // ✅ Verifică dacă email-ul este valid
      if (!email) {
        throw new Error("Invalid email: email is undefined or empty.");
      }

      const existingUserSnapshot = await adminDb
        .collection("users")
        .where("email", "==", email)
        .get();

      return !existingUserSnapshot.empty;
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error checking user existence:", error);
      throw new Error("Error checking user existence");
    }
  }

  /**
   * ✅ Obține toate invitațiile
   */
  static async getAllInvitations(page: number, pageSize: number) {
    try {
      const snapshot = await adminDb
        .collection("invitations")
        .orderBy("createdAt", "desc")
        .limit(pageSize)
        .startAfter((page - 1) * pageSize)
        .get();

      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error retrieving all invitations:", error);
      throw new Error("Error retrieving all invitations");
    }
  }

  /**
   * ✅ Dashboard pentru admini - oferă statistici despre invitații
   */
  static async getInvitationsDashboard(
    page: number = 1,
    pageSize: number = 50
  ): Promise<any> {
    try {
      const offset = (page - 1) * pageSize;
      const invitationsSnapshot = await adminDb
        .collection("invitations")
        .orderBy("createdAt", "desc")
        .offset(offset)
        .limit(pageSize)
        .get();

      if (invitationsSnapshot.empty) {
        return {
          totalInvitations: 0,
          statusCounts: {
            pending: 0,
            accepted: 0,
            revoked: 0,
            expired: 0,
          },
          topFailedAttempts: [],
          topInviters: [],
        };
      }

      const invitations: InvitationData[] = invitationsSnapshot.docs.map(
        (doc) => doc.data() as InvitationData
      );

      // 🔹 Structură pentru contorizarea statusurilor
      const statusCounts: Record<
        "pending" | "accepted" | "revoked" | "expired",
        number
      > = {
        pending: 0,
        accepted: 0,
        revoked: 0,
        expired: 0,
      };

      let failedAttemptsList: { email: string; failedAttempts: number }[] = [];
      let inviterCount: Record<string, number> = {}; // 🔹 Contor pentru top inviters

      invitations.forEach((invite) => {
        // ✅ Verificare mai sigură a statusurilor
        if (Object.prototype.hasOwnProperty.call(statusCounts, invite.status)) {
          statusCounts[
            invite.status as "pending" | "accepted" | "revoked" | "expired"
          ]++;
        }

        // ✅ Verificare pentru failedAttempts (cu valoare implicită 0)
        if ((invite.failedAttempts ?? 0) > 0) {
          failedAttemptsList.push({
            email: invite.email,
            failedAttempts: invite.failedAttempts ?? 0,
          });
        }

        // ✅ Verificare pentru invitedBy (evită probleme cu undefined)
        if (invite.invitedBy) {
          inviterCount[invite.invitedBy] =
            (inviterCount[invite.invitedBy] ?? 0) + 1;
        }
      });

      // 🔹 Sortăm top 5 invitatori
      const topInviters = Object.entries(inviterCount)
        .map(([inviter, count]) => ({ email: inviter, totalInvites: count }))
        .sort((a, b) => b.totalInvites - a.totalInvites)
        .slice(0, 5);

      // 🔹 Sortăm top 5 utilizatori cu cele mai multe încercări eșuate
      failedAttemptsList.sort((a, b) => b.failedAttempts - a.failedAttempts);

      return {
        totalInvitations: invitations.length,
        statusCounts,
        topFailedAttempts: failedAttemptsList.slice(0, 5),
        topInviters,
        currentPage: page,
        pageSize: pageSize,
      };
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error retrieving invitations dashboard:", error);
      throw new Error("Error retrieving invitations dashboard");
    }
  }

  static async sendRemindersForExpiringInvitations(): Promise<void> {
    try {
      const now = new Date();
      const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 ore

      // 🔹 Obținem invitațiile care expiră în următoarele 3 ore și nu au primit reminder
      const snapshot = await adminDb
        .collection("invitations")
        .where("expiresAt", "<=", threeHoursLater.toISOString())
        .where("reminderSent", "==", false)
        .get();

      if (snapshot.empty) {
        console.log("✅ No expiring invitations need reminders.");
        return;
      }

      const invitations = snapshot.docs.map(
        (doc) => new Invitation({ id: doc.id, ...doc.data() })
      );

      // 🔹 Trimitem reminder folosind repository-ul
      for (const invitation of invitations) {
        await this.invitationRepository.sendReminder(invitation.inviteToken);
      }

      console.log(
        `📢 Sent reminders for ${invitations.length} expiring invitations.`
      );
    } catch (error) {
      Sentry.captureException(error);
      console.error(
        "❌ Error sending reminders for expiring invitations:",
        error
      );
      throw new Error("Error sending reminders for expiring invitations");
    }
  }

  /**
   * ✅ Marchează automat invitațiile expirate
   */
  static async expireInvitations(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // 🔹 Căutăm invitațiile care au expirat
      const snapshot = await adminDb
        .collection("invitations")
        .where("expiresAt", "<", now)
        .where("status", "==", "pending")
        .get();

      if (snapshot.empty) {
        console.log("✅ No expired invitations found.");
        return;
      }

      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => {
        const invitationRef = adminDb.collection("invitations").doc(doc.id);

        batch.update(invitationRef, {
          status: "expired",
          changeLogs: admin.firestore.FieldValue.arrayUnion({
            date: new Date().toISOString(),
            field: "status",
            oldValue: "pending",
            newValue: "expired",
          }),
        });

        console.log(`❌ Invitation expired: ${doc.id}`);
      });

      await batch.commit();
      console.log(
        `✅ ${snapshot.size} invitations have been marked as expired.`
      );
    } catch (error) {
      Sentry.captureException(error);
      console.error("❌ Error expiring invitations:", error);
      throw new Error("Error expiring invitations");
    }
  }
}
