import { ISuperuserRepository } from "../Interfaces/ISuperuserRepository";
import { Superuser } from "../models/superuserModel";
import BaseRepository from "./BaseRepository";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import LoggerService from "../services/LoggerService";

class SuperuserRepository extends BaseRepository<Superuser> implements ISuperuserRepository {
  constructor() {
    super("superusers");
  }

  async createSuperuser(superuser: Superuser): Promise<Superuser> {
    const id = superuser.id || this.db.generateId(this.collectionName);
    const newSuperuser = new Superuser({ ...superuser, id });

    const createdSuperuser = await super.create(newSuperuser);

    await EventService.emitEvent(EventTypes.SUPERUSER_SETUP, {
      superuserId: id,
      email: newSuperuser.email
    });

    LoggerService.logInfo(`👤 Superuser created: ${createdSuperuser.email}`);
    return createdSuperuser;
  }

  async getSuperuser(superuserId: string): Promise<Superuser> {
    return await this.getById(superuserId);
  }

  async getAllSuperusers(): Promise<Superuser[]> {
    return await this.getAll();
  }

  async updateSuperuser(id: string, superuserData: Partial<Superuser>): Promise<Superuser> {
    const updatedSuperuser = await this.update(id, superuserData);
    
    LoggerService.logInfo(`📝 Superuser updated: ${updatedSuperuser.email}`);
    return updatedSuperuser;
  }

  async deleteSuperuser(id: string): Promise<Superuser> {
    const deletedSuperuser = await this.delete(id);

    await EventService.emitEvent(EventTypes.SUPERUSER_DELETED, {
      superuserId: deletedSuperuser.id, // 🔹 Eliminăm `email` dacă nu este suportat în eveniment
    });

    LoggerService.logInfo(`🗑️ Superuser deleted: ${deletedSuperuser.email}`);
    return deletedSuperuser;
  }

  async deleteMultipleSuperusers(ids: string[]): Promise<Superuser[]> {
    const deletedSuperusers = await this.deleteMultiple(ids);

    LoggerService.logInfo(`🗑️ Deleted ${deletedSuperusers.length} superusers`);
    return deletedSuperusers;
  }

  async cloneSuperuser(superuser: Superuser): Promise<Superuser> {
    const id = this.db.generateId(this.collectionName);
    const clonedSuperuser = new Superuser({
      ...superuser,
      id,
      email: `clone_${superuser.email}`,
    });

    const createdClone = await super.create(clonedSuperuser);

    await EventService.emitEvent(EventTypes.SUPERUSER_CLONED, {
      superuserId: createdClone.id,
      email: createdClone.email,
    });

    LoggerService.logInfo(`🔄 Superuser cloned: ${createdClone.email}`);
    return createdClone;
  }
}

export default new SuperuserRepository();
