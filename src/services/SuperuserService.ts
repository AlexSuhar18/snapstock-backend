import SuperuserRepository from "../repositories/SuperuserRepository";
import LoggerService from "../services/LoggerService";
import { EventTypes } from "../events/EventTypes";
import EventService from "../services/EventService";
import { Superuser } from "../models/superuserModel";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors";
import SuperuserValidationService from "../services/validation/SuperuserValidationService";

class SuperuserService {
  /**
   * ✅ Creează un superuser nou cu validare suplimentară
   */
  static async setupSuperuser(data: Partial<Superuser>): Promise<Superuser> {
    try {
      // 🔍 Validare input
      SuperuserValidationService.validateCreateSuperuser(data);

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
      if (!superuserId) {
        throw new BadRequestError("Superuser ID is required");
      }

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
   * ✅ Obține un superuser după email, cu validare suplimentară
   */
  static async findByEmail(email: string): Promise<Superuser | null> {
    try {
      if (!SuperuserValidationService.isValidEmail(email)) {
        throw new BadRequestError(`Invalid email format: ${email}`);
      }

      LoggerService.logInfo(`🔍 Fetching superuser by email: ${email}`);
      const superuser = await SuperuserRepository.findByEmail(email);

      if (!superuser) {
        LoggerService.logWarn(`⚠️ No superuser found for email: ${email}`);
        return null;
      }

      LoggerService.logInfo(`✅ Superuser found: ${superuser.email}`);
      return superuser;
    } catch (error) {
      LoggerService.logError(`❌ Error fetching superuser by email: ${email}`, error);
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
/**
 * ✅ Șterge toți superuserii
 */
static async deleteAllSuperusers(): Promise<void> {
  try {
    // 📥 Obținem toți superuserii pentru a le lua ID-urile
    const superusers = await SuperuserRepository.getAllSuperusers();
    const ids = superusers.map((user: Superuser) => user.id);

    if (ids.length === 0) {
      LoggerService.logWarn("⚠️ No superusers to delete.");
      return;
    }

    // 🔥 Ștergem toți superuserii
    await SuperuserRepository.deleteMultipleSuperusers(ids);
    LoggerService.logInfo("🗑️ All superusers deleted.");
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
      // 🔍 Validare input
      SuperuserValidationService.validateCloneSuperuser(data);

      const clonedSuperuser = await SuperuserRepository.cloneSuperuser(new Superuser(data));

      LoggerService.logInfo(`🔄 Superuser cloned: ${clonedSuperuser.email}`);
      return clonedSuperuser;
    } catch (error) {
      LoggerService.logError("❌ Error cloning superuser", error);
      throw error;
    }
  }

  /**
   * ✅ Atribuie un rol unui superuser
   */
  static async assignRole(superuserId: string, role: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!superuserId || !role) {
        throw new BadRequestError("❌ Superuser ID and role are required.");
      }

      // 🔍 Verifică dacă superuser-ul există
      const superuser = await SuperuserRepository.getSuperuser(superuserId);
      if (!superuser) {
        throw new NotFoundError(`❌ Superuser with ID ${superuserId} not found.`);
      }

      // 🔍 Verifică dacă rolul este valid
      if (!SuperuserValidationService.isValidRole(role)) {
        throw new BadRequestError(`❌ Invalid role: ${role}`);
      }

      // 📌 Atribuie noul rol
      await SuperuserRepository.assignRole(superuserId, "SUPERUSER");

      // 🔥 Emitere eveniment protejat
      try {
        await EventService.emitEvent(EventTypes.SUPERUSER_ROLE_ASSIGNED, { superuserId, email: superuser.email, role: "SUPERUSER" });
      } catch (eventError) {
        LoggerService.logError("⚠️ Error emitting SUPERUSER_ROLE_ASSIGNED event", eventError);
      }

      LoggerService.logInfo(`🔑 Role '${role}' assigned to superuser: ${superuserId}`);
      return { success: true, message: `✅ Role '${role}' assigned successfully` };
    } catch (error) {
      LoggerService.logError("❌ Error assigning role to superuser", error);
      throw error;
    }
  }
}

export default SuperuserService;
