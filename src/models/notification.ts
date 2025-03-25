import crypto from "crypto";
import { BadRequestError } from "../errors/CustomErrors";

export class Notification {
  readonly id: string;
  userId: string;
  recipient: string;
  type: "email" | "sms" | "push";
  message: string;
  status: "pending" | "sent" | "failed";
  createdAt: string;
  updatedAt: string;
  sentAt?: string | null;
  errorMessage?: string | null;
  read: boolean;

  constructor(data: Partial<Notification>) {
    if (!data.userId) {
      throw new BadRequestError("❌ userId is required.");
    }
    if (!data.message) {
      throw new BadRequestError("❌ message is required.");
    }

    this.id = data.id ?? crypto.randomUUID(); // ✅ Generăm ID unic
    this.userId = data.userId;
    this.recipient = data.recipient ?? "";
    this.message = data.message; // ✅ Asigurăm inițializarea corectă

    // ✅ Valori implicite corecte pentru `type` și `status`
    this.type = data.type ?? "email";
    this.status = data.status ?? "pending";

    this.createdAt = data.createdAt ?? new Date().toISOString();
    this.updatedAt = data.updatedAt ?? new Date().toISOString();
    this.sentAt = data.sentAt ?? null;
    this.errorMessage = data.errorMessage ?? null;
    this.read = data.read ?? false;
  }

  /**
   * ✅ Verifică dacă notificarea a expirat (auto-expirare după 30 zile)
   */
  isExpired(): boolean {
    const expirationDate = new Date(this.createdAt);
    expirationDate.setDate(expirationDate.getDate() + 30);
    return new Date() > expirationDate;
  }

  /**
   * ✅ Actualizează notificarea și setează `updatedAt`
   */
  update(data: Partial<Notification>): void {
    if (data.message) this.message = data.message;
    
    if (data.status) {
      if (!["pending", "sent", "failed"].includes(data.status)) {
        throw new BadRequestError("❌ Invalid status value.");
      }
      this.status = data.status;
    }

    if (data.type) {
      if (!["email", "sms", "push"].includes(data.type)) {
        throw new BadRequestError("❌ Invalid notification type.");
      }
      this.type = data.type;
    }

    if (data.read !== undefined) this.read = data.read;
    this.updatedAt = new Date().toISOString();
  }
}
