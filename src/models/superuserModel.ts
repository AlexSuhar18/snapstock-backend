export class Superuser {
    id: string;
    email: string;
    fullName: string;
    createdAt?: string;
    updatedAt?: string;
    lastLogin?: string | null;
    role: "SUPERUSER";
    isFounder: boolean;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    permissions: {
        canManageCustomers: boolean;
        canManageUsers: boolean;
        canManageAccounts: boolean;
        canManagePlans: boolean;
        canAccessAllData: boolean;
        canModifySettings: boolean;
        canManageProducts: boolean;
    };
    security: {
        twoFactorAuth: boolean;
        password: string;
        backupCodes: string[];
    };
    logs?: Array<{
        action: string;
        timestamp: string;
        ipAddress: string;
        details?: any;
    }>;
    settings: {
        theme: "light" | "dark" | "system";
        language: string;
        notificationPreferences: {
            email: boolean;
            sms: boolean;
        };
    };
    cloneable: boolean;

    constructor(data: Partial<Superuser>) {
        this.id = data.id || "";
        this.email = data.email || "";
        this.fullName = data.fullName || "";
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.lastLogin = data.lastLogin ?? undefined;
        this.role = "SUPERUSER";
        this.isFounder = data.isFounder ?? false;
        this.status = data.status || "ACTIVE";
        this.permissions = data.permissions || {
            canManageCustomers: false,
            canManageUsers: false,
            canManageAccounts: false,
            canManagePlans: false,
            canAccessAllData: false,
            canModifySettings: false,
            canManageProducts: false,
        };
        this.security = data.security || {
            twoFactorAuth: false,
            password: "",
            backupCodes: []
        };
        this.logs = data.logs || [];
        this.settings = data.settings || {
            theme: "system",
            language: "en",
            notificationPreferences: {
                email: true,
                sms: false
            }
        };
        this.cloneable = data.cloneable ?? true;
    }
}
