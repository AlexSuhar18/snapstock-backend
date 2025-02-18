export class Invitation {
    id: string;
    email: string;
    role: string;
    invitedBy: string;
    invitedByName?: string | null;
    inviteToken: string;
    createdAt?: string;
    expiresAt?: string;
    acceptedAt?: string | null;
    revokedAt?: string | null;
    status: "pending" | "accepted" | "expired" | "revoked";

    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    companyId?: string | null;
    department?: string | null;
    userType?: "internal" | "external";
    resendCount?: number;

    maxAttempts?: number;
    attemptsMade?: number;
    lastAttemptAt?: string | null;
    failedAttempts?: number;
    acceptedByIp?: string | null;
    acceptedByDevice?: string | null;
    acceptedFromLocation?: string | null;

    reminderSent?: boolean;
    reminderSentAt?: string | null;
    emailSentAt?: string | null;
    smsSentAt?: string | null;
    inviteMethod?: "email" | "sms" | "both";
    expiresInDays?: number;

    permissions?: string[];
    language?: string;
    timezone?: string;
    additionalNotes?: string | null;

    changeLogs?: Array<{ date: string; field: string; oldValue: any; newValue: any }>;
    historyLog?: Array<{ action: string; timestamp: string; details?: any }>;

    constructor(data: Partial<Invitation>) {
        this.id = data.id || "";
        this.email = data.email || "";
        this.role = data.role || "";
        this.invitedBy = data.invitedBy || "";
        this.invitedByName = data.invitedByName ?? undefined;
        this.inviteToken = data.inviteToken || "";
        this.createdAt = data.createdAt || new Date().toISOString();
        this.expiresAt = data.expiresAt || new Date().toISOString();
        this.acceptedAt = data.acceptedAt ?? null;
        this.revokedAt = data.revokedAt ?? null;
        this.status = data.status || "pending";

        this.firstName = data.firstName ?? null;
        this.lastName = data.lastName ?? null;
        this.phoneNumber = data.phoneNumber ?? null;
        this.companyId = data.companyId ?? null;
        this.department = data.department ?? null;
        this.userType = data.userType ?? "internal";
        this.resendCount = data.resendCount ?? 0;

        this.maxAttempts = data.maxAttempts ?? 5;
        this.attemptsMade = data.attemptsMade ?? 0;
        this.failedAttempts = data.failedAttempts ?? 0;
        this.lastAttemptAt = data.lastAttemptAt ?? null;
        this.acceptedByIp = data.acceptedByIp ?? null;
        this.acceptedByDevice = data.acceptedByDevice ?? null;
        this.acceptedFromLocation = data.acceptedFromLocation ?? null;

        this.reminderSent = data.reminderSent ?? false;
        this.reminderSentAt = data.reminderSentAt ?? null;
        this.emailSentAt = data.emailSentAt ?? null;
        this.smsSentAt = data.smsSentAt ?? null;
        this.inviteMethod = data.inviteMethod ?? "email";
        this.expiresInDays = data.expiresInDays ?? 1;

        this.permissions = data.permissions ?? [];
        this.language = data.language ?? "en";
        this.timezone = data.timezone ?? "UTC";
        this.additionalNotes = data.additionalNotes ?? null;

        this.changeLogs = data.changeLogs ?? [];
        this.historyLog = data.historyLog ?? [];
    }
}
