import { Invitation } from "../models/invitationModel";

export interface IInvitationRepository {
  getById(id: string): Promise<Invitation | null>;
  getByToken(token: string): Promise<Invitation | null>;
  getByEmail(email: string): Promise<Invitation | null>;
  getAll(): Promise<Invitation[]>;
  create(invitation: Invitation): Promise<Invitation>;
  update(id: string, invitation: Partial<Invitation>): Promise<Invitation>;
  delete(id: string): Promise<Invitation | null>;
  markAccepted(token: string): Promise<Invitation>;
  markRevoked(token: string): Promise<Invitation>;
  sendReminder(token: string): Promise<Invitation | null>;
  expireInvitations(): Promise<Invitation[]>;
}
