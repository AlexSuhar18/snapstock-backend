import admin from "firebase-admin";

const INVITATION_COLLECTION = "invitations";


export class Invitation {
    email: string;
    role: string;
    invitedBy: string;
    invitedByName?: string;
    inviteToken: string;
    createdAt: string;
    expiresAt: string;
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

    // 🔹 Log al modificărilor invitației
    changeLogs?: Array<{ date: string; field: string; oldValue: any; newValue: any }>;

    // 🔹 Log detaliat al acțiunilor invitației
    historyLog?: Array<{ action: string; timestamp: string; details?: any }>;

    constructor(data: any) {
        this.email = data.email;
        this.role = data.role;
        this.invitedBy = data.invitedBy;
        this.invitedByName = data.invitedByName || null;
        this.inviteToken = data.inviteToken;

        this.createdAt = Invitation.formatTimestamp(data.createdAt, "createdAt");
        this.expiresAt = Invitation.formatTimestamp(data.expiresAt, "expiresAt");
        this.acceptedAt = data.acceptedAt ? Invitation.formatTimestamp(data.acceptedAt, "createdAt") : null;
        this.revokedAt = data.revokedAt ? Invitation.formatTimestamp(data.revokedAt, "expiresAt") : null;
        this.status = data.status || "pending";

        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.phoneNumber = data.phoneNumber || null;
        this.companyId = data.companyId || null;
        this.department = data.department || null;
        this.userType = data.userType || "internal";
        this.resendCount = data.resendCount ?? 0;

        this.attemptsMade = data.attemptsMade ?? 0;
        this.maxAttempts = data.maxAttempts ?? 5;
        this.failedAttempts = data.failedAttempts || 0;
        this.lastAttemptAt = data.lastAttemptAt ? Invitation.formatTimestamp(data.lastAttemptAt, "createdAt") : null;
        this.acceptedByIp = data.acceptedByIp || null;
        this.acceptedByDevice = data.acceptedByDevice || null;
        this.acceptedFromLocation = data.acceptedFromLocation || null;

        this.reminderSent = data.reminderSent || false;
        this.reminderSentAt = data.reminderSentAt ? Invitation.formatTimestamp(data.reminderSentAt, "createdAt") : null;
        this.emailSentAt = data.emailSentAt ? Invitation.formatTimestamp(data.emailSentAt, "createdAt") : null;
        this.smsSentAt = data.smsSentAt ? Invitation.formatTimestamp(data.smsSentAt, "createdAt") : null;
        this.inviteMethod = data.inviteMethod || "email";
        this.expiresInDays = data.expiresInDays || 1;

        this.permissions = data.permissions || [];
        this.language = data.language || "en";
        this.timezone = data.timezone || "UTC";
        this.additionalNotes = data.additionalNotes || null;

        this.changeLogs = data.changeLogs || [];
        this.historyLog = data.historyLog || [];
    }

   /**
 * ✅ Convertim timestamp într-un format ușor de citit și validăm corect
 */
   static formatTimestamp(timestamp: any, type: "createdAt" | "expiresAt"): string {
    console.log(`🔍 Checking timestamp (${type} - RAW):`, timestamp, typeof timestamp);

    // 🔹 1. Dacă timestamp-ul nu există, returnăm "N/A"
    if (!timestamp) {
        console.warn(`⚠️ Invalid timestamp detected for ${type}:`, timestamp);
        return "N/A";
    }

    let date: Date | null = null;

    // 🔹 2. Dacă timestamp-ul este un Firestore Timestamp
    if (timestamp instanceof admin.firestore.Timestamp) {
        date = timestamp.toDate();
    }
    // 🔹 3. Dacă timestamp-ul este un string valid (ISO format)
    else if (typeof timestamp === "string" && !isNaN(Date.parse(timestamp))) {
        date = new Date(timestamp);
    }
    // 🔹 4. Dacă timestamp-ul este deja un obiect Date
    else if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
        date = timestamp;
    }

    if (!date || isNaN(date.getTime())) {
        console.warn(`⚠️ Invalid formatted timestamp for ${type}:`, timestamp);
        return "N/A";
    }

    // ✅ Dacă tipul este `createdAt`, returnăm data în format clar
    if (type === "createdAt") {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short"
        }).format(date);
    }

    // ✅ Dacă tipul este `expiresAt`, calculăm timpul rămas
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

    if (diffInSeconds <= 0) return "Expired";

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const years = Math.floor(days / 365);

    if (years > 0) return `Expires in ${years} years`;
    if (weeks > 0) return `Expires in ${weeks} weeks`;
    if (days > 0) return `Expires in ${days} days`;
    if (hours > 0) return `Expires in ${hours} hours`;
    if (minutes > 0) return `Expires in ${minutes} minutes`;
    return `Expires in ${diffInSeconds} seconds`;
}

    //** ✅ Verificăm dacă invitația a expirat în mod corect
   isExpired(): boolean {
       if (!this.expiresAt || this.expiresAt === "N/A") return false;
       return new Date(this.expiresAt).getTime() < Date.now();
   }
   
    /**
     * ✅ Convertim obiectul într-un format simplu fără metode
     */
    toObject(): Record<string, any> {
        return JSON.parse(JSON.stringify(this));
    }

    /**
 * ✅ Verificăm dacă invitația este activă
 */
isActive(): boolean {
    return this.status === "pending" && !this.isExpired();
}
}
