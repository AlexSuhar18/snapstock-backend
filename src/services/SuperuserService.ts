import SuperuserRepository from "../repositories/SuperuserRepository";
import LoggerService from "../services/LoggerService";
import { EventTypes } from "../events/EventTypes";
import EventService from "../services/EventService";
import { Superuser } from "../models/superuserModel";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors";

class SuperuserService {
  /**
   * ✅ Creează un superuser nou
   */
  static async setupSuperuser(data: Partial<Superuser>): Promise<Superuser> {
    try {
      if (!data.email || !data.fullName) {
        throw new BadRequestError("Missing required fields: email, fullName");
      }

      const superuser = await SuperuserRepository.createSuperuser(new Superuser(data));

      LoggerService.logInfo(`✅ Superuser created: ${superuser.email}`);
      return superuser;
    } catch (error) {
      LoggerService.logError("❌ Error setting up superuser", error);
      throw error;
    }
  }

  /**
   * ✅ Obține un superuser după ID
   */
  static async getSuperuser(superuserId: string): Promise<Superuser> {
    try {
      const superuser = await SuperuserRepository.getSuperuser(superuserId);
      if (!superuser) {
        throw new NotFoundError("Superuser not found");
      }
      return superuser;
    } catch (error) {
      LoggerService.logError("❌ Error fetching superuser", error);
      throw error;
    }
  }

  /**
   * ✅ Obține toți superuserii
   */
  static async getAllSuperusers(): Promise<Superuser[]> {
    try {
      return await SuperuserRepository.getAllSuperusers();
    } catch (error) {
      LoggerService.logError("❌ Error fetching all superusers", error);
      throw error;
    }
  }

  /**
   * ✅ Șterge un superuser după ID
   */
  static async deleteSuperuser(superuserId: string): Promise<void> {
    try {
      if (!superuserId) {
        throw new BadRequestError("Superuser ID is required");
      }

      await SuperuserRepository.deleteSuperuser(superuserId);
      LoggerService.logInfo(`🗑️ Superuser deleted: ID ${superuserId}`);
    } catch (error) {
      LoggerService.logError("❌ Error deleting superuser", error);
      throw error;
    }
  }

  /**
   * ✅ Șterge toți superuserii
   */
  static async deleteAllSuperusers(): Promise<void> {
    try {
      await SuperuserRepository.deleteAllSuperusers();
      LoggerService.logInfo("🗑️ All superusers deleted");
    } catch (error) {
      LoggerService.logError("❌ Error deleting all superusers", error);
      throw error;
    }
  }

  /**
   * ✅ Clonează un superuser existent
   */
  static async cloneSuperuser(data: Partial<Superuser>): Promise<Superuser> {
    try {
      if (!data.email || !data.fullName) {
        throw new BadRequestError("Missing required fields: email, fullName");
      }

      const clonedSuperuser = await SuperuserRepository.cloneSuperuser(new Superuser(data));

      LoggerService.logInfo(`🔄 Superuser cloned: ${clonedSuperuser.email}`);
      return clonedSuperuser;
    } catch (error) {
      LoggerService.logError("❌ Error cloning superuser", error);
      throw error;
    }
  }
}

export default SuperuserService;
