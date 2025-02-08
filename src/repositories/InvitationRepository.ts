import { Invitation } from "../models/invitation";

export interface InvitationRepository {
    save(invitation: Invitation): Promise<void>;
    getByToken(token: string): Promise<Invitation | null>;
    markAccepted(inviteToken: string): Promise<void>;
    markRevoked(inviteToken: string): Promise<void>;
    sendReminder(inviteToken: string): Promise<void>;
    update(invitation: Invitation): Promise<void>;
    incrementFailedAttempts(inviteToken: string): Promise<void>;
    getByEmail(email: string): Promise<Invitation | null>;
}
