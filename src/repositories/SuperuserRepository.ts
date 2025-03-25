import { ISuperuserRepository } from "../Interfaces/ISuperuserRepository";
import { Superuser } from "../models/superuserModel";
import BaseRepository from "./BaseRepository";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import LoggerService from "../services/LoggerService";
import { NotFoundError, BadRequestError } from "../errors/CustomErrors";

class SuperuserRepository extends BaseRepository<Superuser> implements ISuperuserRepository {
  constructor() {
    super("superusers");
  }

  async createSuperuser(superuser: Superuser): Promise<Superuser> {
    if (!superuser.email || typeof superuser.email !== "string" || !superuser.email.includes("@")) {
      throw new BadRequestError("❌ Invalid email address.");
    }

    const id = superuser.id || this.db.generateId(this.collectionName);
    const newSuperuser = new Superuser({ ...superuser, id });

    const createdSuperuser = await super.create(newSuperuser);

    try {
      await EventService.emitEvent(EventTypes.SUPERUSER_SETUP, {
        superuserId: id,
        email: newSuperuser.email,
      });
    } catch (error) {
      LoggerService.logError(`❌ Failed to emit SUPERUSER_SETUP event: ${error}`);
    }

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

    try {
      await EventService.emitEvent(EventTypes.SUPERUSER_DELETED, {
        superuserId: deletedSuperuser.id,
      });
    } catch (error) {
      LoggerService.logError(`❌ Failed to emit SUPERUSER_DELETED event: ${error}`);
    }

    LoggerService.logInfo(`🗑️ Superuser deleted: ${deletedSuperuser.email}`);
    return deletedSuperuser;
  }

  /**
   * ✅ Șterge toți superuserii
   */
  /**
 * ✅ Șterge toți superuserii
 */
async deleteAllSuperusers(): Promise<void> {
  try {
    // 📥 Obținem toți superuserii pentru a le lua ID-urile
    const superusers = await this.getAllSuperusers(); // 🔹 Corect: folosește `this`
    const ids = superusers.map((user: Superuser) => user.id); // 🔹 Corect: adaugă tipul

    if (ids.length === 0) {
      LoggerService.logWarn("⚠️ No superusers to delete.");
      return;
    }

    // 🔥 Ștergem toți superuserii
    await this.deleteMultipleSuperusers(ids); // 🔹 Corect: folosește `this`
    LoggerService.logInfo("🗑️ All superusers deleted.");
  } catch (error) {
    LoggerService.logError("❌ Error deleting all superusers", error);
    throw error;
  }
}
  /**
 * ✅ Șterge mai mulți superuseri
 */
async deleteMultipleSuperusers(ids: string[]): Promise<Superuser[]> {
  try {
      if (!ids.length) {
          LoggerService.logWarn("⚠️ No superusers found to delete.");
          return [];
      }

      const deletedSuperusers = await this.deleteMultiple(ids);
      LoggerService.logInfo(`🗑️ Deleted ${deletedSuperusers.length} superusers.`);

      // 🔥 Emitere evenimente individuale pentru fiecare superuser șters
      await Promise.all(
          deletedSuperusers.map(async (superuser) => {
              await EventService.emitEvent(EventTypes.SUPERUSER_DELETED, {
                  superuserId: superuser.id, // Folosim `superuserId` corect
              });
          })
      );

      return deletedSuperusers;
  } catch (error) {
      LoggerService.logError("❌ Error deleting multiple superusers", error);
      throw error;
  }
}

  /**
   * ✅ Găsește un superuser după email
   */
  async findByEmail(email: string): Promise<Superuser | null> {
    if (!email || typeof email !== "string") {
      throw new BadRequestError("❌ Invalid email address.");
    }

    const superuser = await this.getByField("email", email);
    if (!superuser) {
      LoggerService.logWarn(`⚠️ No superuser found for email: ${email}`);
      return null;
    }

    LoggerService.logInfo(`✅ Superuser found for email: ${email}`);
    return superuser;
  }

  /**
   * ✅ Atribuie un rol unui superuser
   */
  async assignRole(superuserId: string, role: "SUPERUSER"): Promise<void> {
    if (role !== "SUPERUSER") {
      throw new BadRequestError(`❌ Invalid role: ${role}. Only "SUPERUSER" is allowed.`);
    }

    const superuser = await this.getById(superuserId);
    if (!superuser) {
      throw new NotFoundError(`❌ Superuser with ID ${superuserId} not found.`);
    }

    await this.update(superuserId, { role });

    try {
      await EventService.emitEvent(EventTypes.SUPERUSER_UPDATED, {
        superuserId,
        email: superuser.email,
      });
    } catch (error) {
      LoggerService.logError("❌ Failed to emit SUPERUSER_UPDATED event", error);
    }

    LoggerService.logInfo(`✅ Role 'SUPERUSER' assigned to superuser ID: ${superuserId}`);
  }

  /**
   * ✅ Clonează un superuser
   */
  async cloneSuperuser(superuser: Superuser): Promise<Superuser> {
    try {
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
    } catch (error) {
      LoggerService.logError("❌ Error cloning superuser", error);
      throw error;
    }
  }
}

export default new SuperuserRepository();
