import { Superuser } from "../models/superuserModel";

export interface ISuperuserRepository {
  createSuperuser(superuser: Superuser): Promise<Superuser>;
  getSuperuser(id: string): Promise<Superuser>;
  getAllSuperusers(): Promise<Superuser[]>;
  updateSuperuser(id: string, superuserData: Partial<Superuser>): Promise<Superuser>;
  deleteSuperuser(id: string): Promise<Superuser>;
  deleteMultipleSuperusers(ids: string[]): Promise<Superuser[]>; // 🔹 Adăugăm deleteMultiple
  cloneSuperuser(superuser: Superuser): Promise<Superuser>;
}
