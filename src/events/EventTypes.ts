export enum EventTypes {
    SERVER_STARTED = "server:started",
    SYSTEM_ERROR = "system:error",

    STOCK_CREATED = "stock:created",
    STOCK_UPDATED = "stock:updated",
    STOCK_DELETED = "stock:deleted",
    STOCK_REPORT_GENERATED = "stock:report_generated",

    INVITATION_CREATED = "invite:create",
    INVITATION_UPDATED = "invite:updated",
    INVITATION_ACCEPTED = "invite:accepted",
    INVITATION_REVOKED = "invite:revoked",
    INVITATION_DELETED = "invite:delete",
    INVITATION_REMINDER_SENT = "invite:reminder",
    INVITATION_EXPIRED = "invite:expired",
    INVITATION_RESENT = "invite:resent",

    SUPERUSER_SETUP = "superuser:setup",
    SUPERUSER_UPDATED = "superuser:updated",
    SUPERUSER_DELETED = "superuser:deleted",
    SUPERUSER_CLONED = "superuser:cloned",
    ALL_SUPERUSERS_DELETED = "superuser:all_deleted",

    MODULE_ENABLED = "module:enabled",
    MODULES_RELOADED = "module:reloaded",
    MODULE_DISABLED = "module:disabled",

    DOCUMENT_CREATED = "document:created",
    DOCUMENT_UPDATED = "document:updated", 
    DOCUMENT_DELETED = "document:deleted", 
    ALL_DOCUMENTS_DELETED = "db:all_documents_deleted", 
    DOCUMENT_QUERIED = "DOCUMENT_QUERIED",

    EMAIL_SENT = "email:sent",
    EMAIL_FAILED = "email:failed",
    PASSWORD_VALIDATED = "validation:password_validated",
    EMAIL_VALIDATED = "validation:email_validated",
    EMAIL_DOMAIN_CHECKED = "validation:email_domain_checked",
    EMAIL_DUPLICATE_CHECKED = "validation:email_duplicate_checked",

    SMS_MODULE_FAILED = "sms:module_failed",
    SMS_SENT = "sms:sent",
    SMS_FAILED = "sms:failed",

    // ✅ Evenimente pentru logare
    LOG_INFO = "log:info",
    LOG_ERROR = "log:error",
    LOG_WARN = "log:warn",
    LOG_DEBUG = "log:debug",

    EXTERNAL_LOG_SENT = "log:external_sent",
    EXTERNAL_LOG_FAILED = "log:external_failed",

    RATE_LIMITER_CREATED = "rateLimiter:created",
    RATE_LIMITER_FAILED = "rateLimiter:failed",

    // ✅ Evenimente pentru notificări
    NOTIFICATION_SENT = "notification:sent",
    NOTIFICATION_FAILED = "notification:failed",
    NOTIFICATION_DELETED = "notification:deleted",
    NOTIFICATION_ADMIN_FAILED = "notification:adminNotifyFailed",
    ADMIN_NOTIFICATION = "admin:notification",

    // ✅ Evenimente pentru monitorizare
    MONITOR_EVENT = "monitor:event",

    REMINDER_EMAIL_SENT = "reminder:emailSent",
    REMINDER_EMAIL_FAILED = "reminder:emailFailed",
}

/**
 * ✅ Definim payload-ul fiecărui tip de eveniment
 */
export interface EventData {
    [EventTypes.SERVER_STARTED]: { port: number };
    [EventTypes.SYSTEM_ERROR]: { message: string; stack?: string };

    [EventTypes.STOCK_CREATED]: { stockId: string; name: string };
    [EventTypes.STOCK_UPDATED]: { stockId: string; quantity: number };
    [EventTypes.STOCK_DELETED]: { stockId: string };

    [EventTypes.INVITATION_CREATED]: { email: string; inviteId: string };
    [EventTypes.INVITATION_UPDATED]: { email: string; inviteId: string };
    [EventTypes.INVITATION_ACCEPTED]: { email: string; inviteId: string };
    [EventTypes.INVITATION_REVOKED]: { email: string; inviteId: string; reason?: string };
    [EventTypes.INVITATION_DELETED]: { inviteId: string };
    [EventTypes.INVITATION_REMINDER_SENT]: { email: string; inviteId: string };
    [EventTypes.INVITATION_EXPIRED]: { email: string; inviteId: string };
    [EventTypes.INVITATION_RESENT]: { email: string; inviteId: string }; // ✅ Adăugat payload pentru retrimitere

    [EventTypes.SUPERUSER_SETUP]: { superuserId: string; email: string };
    [EventTypes.SUPERUSER_UPDATED]: { superuserId: string; email: string };
    [EventTypes.SUPERUSER_DELETED]: { superuserId: string };
    [EventTypes.SUPERUSER_CLONED]: { superuserId: string; email: string };
    [EventTypes.ALL_SUPERUSERS_DELETED]: {};

    [EventTypes.MODULE_ENABLED]: { moduleName: string };
    [EventTypes.MODULES_RELOADED]: {moduleName: string};
    [EventTypes.MODULE_DISABLED]: { moduleName: string };

    [EventTypes.DOCUMENT_CREATED]: { collection: string; documentId: string };
    [EventTypes.DOCUMENT_UPDATED]: { collection: string; documentId: string };
    [EventTypes.DOCUMENT_DELETED]: { collection: string; documentId: string };
    [EventTypes.ALL_DOCUMENTS_DELETED]: { collection: string };
    [EventTypes.DOCUMENT_QUERIED]: { collection: string; field: string; value: any; documentId?: any };

    [EventTypes.EMAIL_SENT]: { to: string; subject: string };
    [EventTypes.EMAIL_DOMAIN_CHECKED]: { email: string; domain: string; isAllowed: boolean };
    [EventTypes.EMAIL_FAILED]: { to: string; error: string };
    [EventTypes.PASSWORD_VALIDATED]: { password: string; isStrong: boolean };
    [EventTypes.EMAIL_VALIDATED]: { email: string; isValid: boolean };
    [EventTypes.EMAIL_DUPLICATE_CHECKED]: { email: string; isDuplicate: boolean };

    [EventTypes.SMS_MODULE_FAILED]: { error: any };
    [EventTypes.SMS_SENT]: { phoneNumber: string; message: string; provider: string };
    [EventTypes.SMS_FAILED]: { phoneNumber: string; error: any };

    // ✅ Tipuri pentru event logs
    [EventTypes.LOG_INFO]: { message: string; details?: any };
    [EventTypes.LOG_ERROR]: { message: string; error: any };
    [EventTypes.LOG_WARN]: { message: string; details?: any };
    [EventTypes.LOG_DEBUG]: { message: string; details?: any };
    

    [EventTypes.EXTERNAL_LOG_SENT]: { eventName: string; details?: any };
    [EventTypes.EXTERNAL_LOG_FAILED]: { eventName: string; error: any };
    
    [EventTypes.RATE_LIMITER_CREATED]: { windowMs: number; max: number };
    [EventTypes.RATE_LIMITER_FAILED]: { error: any };

    // ✅ Tipuri pentru notificări
    [EventTypes.NOTIFICATION_SENT]: { email: string; type: string; content: string };
    [EventTypes.NOTIFICATION_FAILED]: { email: string; error: string };
    [EventTypes.NOTIFICATION_DELETED]: {id: string};
    [EventTypes.ADMIN_NOTIFICATION]: { message: string; priority: "high" | "normal" };

    // ✅ Definim payload-ul pentru monitorizare
    [EventTypes.MONITOR_EVENT]: { eventName: string; details?: any };

    [EventTypes.NOTIFICATION_ADMIN_FAILED]: { email: string; error: any };

    [EventTypes.REMINDER_EMAIL_SENT]: { email: string; inviteId: string };
    [EventTypes.REMINDER_EMAIL_FAILED]: { email: string; inviteId: string };
    [EventTypes.STOCK_REPORT_GENERATED]: { reportGeneratedAt: string };
}
