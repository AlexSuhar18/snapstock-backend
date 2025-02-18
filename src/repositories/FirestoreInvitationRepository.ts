import { IInvitationRepository } from "./Interfaces/IInvitationRepository";
import { Invitation } from "../models/invitationModel";
import FirestoreRepository from "./FirestoreRepository";
import * as crypto from "crypto";

class FirestoreInvitationRepository
  extends FirestoreRepository<Invitation>
  implements IInvitationRepository
{
  constructor() {
    super("invitations"); // 🔹 Setăm colecția Firestore
  }

  /**
   * ✅ Obține o invitație după token (folosim metoda din FirestoreRepository)
   */
  async getByToken(token: string): Promise<Invitation | null> {
    return this.getById(token);
  }

  /**
   * ✅ Obține o invitație după email
   */
  async getByEmail(email: string): Promise<Invitation | null> {
    const results = await this.getAll();
    return results.find((inv) => inv.email === email && inv.status === "pending") || null;
  }

  /**
   * ✅ Creează o invitație nouă
   */
  async create(invitation: Invitation): Promise<Invitation> {
    invitation.inviteToken =
      invitation.inviteToken || crypto.randomBytes(16).toString("hex");
    invitation.createdAt = new Date().toISOString();
    invitation.expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    return super.create(invitation);
  }

  /**
   * ✅ Actualizează o invitație (folosim metoda `update` din FirestoreRepository)
   */
  async update(id: string, invitation: Partial<Invitation>): Promise<void> {
    return super.update(id, invitation);
  }

  /**
   * ✅ Șterge o invitație
   */
  async delete(id: string): Promise<void> {
    return super.delete(id);
  }

  /**
   * ✅ Marchează o invitație ca acceptată
   */
  async markAccepted(token: string): Promise<void> {
    await this.update(token, {
      status: "accepted",
      acceptedAt: new Date().toISOString(), // 🔹 Convertim data în string
    });
  }

  /**
   * ✅ Marchează o invitație ca revocată
   */
  async markRevoked(token: string): Promise<void> {
    await this.update(token, {
      status: "revoked",
      revokedAt: new Date().toISOString(), // 🔹 Convertim data în string
    });
  }

  /**
   * ✅ Trimite un reminder pentru invitațiile care expiră în curând
   */
  async sendReminder(token: string): Promise<void> {
    const invitation = await this.getByToken(token);
    if (!invitation || invitation.reminderSent) return;

    await this.update(token, {
      reminderSent: true,
      reminderSentAt: new Date().toISOString(),
    });
  }

  /**
   * ✅ Expiră automat invitațiile care au depășit data de expirare
   */
  async expireInvitations(): Promise<void> {
    const allInvitations = await this.getAll();
    const expiredInvitations = allInvitations.filter(
      (inv) =>
        inv.expiresAt &&
        new Date(inv.expiresAt) <= new Date() &&
        inv.status === "pending"
    );

    for (const invitation of expiredInvitations) {
      await this.update(invitation.inviteToken, { status: "expired" });
    }
  }
}

export default FirestoreInvitationRepository;
