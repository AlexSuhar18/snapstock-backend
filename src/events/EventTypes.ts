/**
 * ✅ Enum pentru tipurile de evenimente din sistem
 */
export enum EventTypes {
    SERVER_STARTED = "server:started",
    SYSTEM_ERROR = "system:error",

    STOCK_CREATED = "stock:created",
    STOCK_UPDATED = "stock:updated",
    STOCK_DELETED = "stock:deleted",

    INVITE_SENT = "invite:sent",
    INVITE_ACCEPTED = "invite:accepted",
    INVITE_REVOKED = "invite:revoked"
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

    [EventTypes.INVITE_SENT]: { email: string; inviteId: string };
    [EventTypes.INVITE_ACCEPTED]: { email: string; userId: string };
    [EventTypes.INVITE_REVOKED]: { email: string; reason?: string };
}