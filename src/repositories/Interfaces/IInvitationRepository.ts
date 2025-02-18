import { Invitation } from "../../models/invitationModel";

export interface IInvitationRepository {
  getById(id: string): Promise<Invitation | null>;
  getByToken(token: string): Promise<Invitation | null>;
  getByEmail(email: string): Promise<Invitation | null>;
  getAll(): Promise<Invitation[]>;
  create(invitation: Invitation): Promise<Invitation>;
  update(id: string, invitation: Partial<Invitation>): Promise<void>;
  delete(id: string): Promise<void>;
  markAccepted(token: string): Promise<void>;
  markRevoked(token: string): Promise<void>;
  sendReminder(token: string): Promise<void>;
  expireInvitations(): Promise<Invitation[]>;
}
