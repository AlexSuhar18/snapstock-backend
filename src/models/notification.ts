export class Notification {
  id: string;
  userId: string;
  recipient: string;
  type: "email" | "sms" | "push";
  message: string;
  status: "pending" | "sent" | "failed";
  createdAt: string;
  sentAt?: string | null;
  errorMessage?: string | null;
  read: boolean;

  constructor(data: Partial<Notification>) {
    this.id = data.id ?? "";
    this.userId = data.userId ?? "";
    this.recipient = data.recipient ?? "";
    this.type = data.type ?? "email";
    this.message = data.message ?? "";
    this.status = data.status ?? "pending";
    this.createdAt = data.createdAt ?? new Date().toISOString();
    this.sentAt = data.sentAt ?? null;
    this.errorMessage = data.errorMessage ?? null;
    this.read = data.read ?? false;
  }
}
