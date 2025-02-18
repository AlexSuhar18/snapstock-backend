import SuperuserRepository from '../repositories/SuperuserRepository';
import LoggerService from '../services/LoggerService';
import EventService from '../services/EventService';
import { BadRequestError } from '../errors/CustomErrors';
import { EventTypes } from '../events/EventTypes';
import { Superuser } from '../models/superuserModel';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';

class SuperuserService {
  /**
   * ✅ Creează un nou superuser
   */
  static async setupSuperuser(data: Partial<Superuser>): Promise<Superuser> {
    ModuleMiddleware.ensureModuleActive("superusers");

    if (!data.email || !data.fullName) {
      throw new BadRequestError('Missing required fields: email, fullName.');
    }

    const newSuperuser = await SuperuserRepository.createSuperuser(new Superuser(data));

    // 🔹 Emit event și log
    await EventService.emitEvent(EventTypes.SUPERUSER_SETUP, { superuserId: newSuperuser.id, email: newSuperuser.email });
    await LoggerService.logInfo(`👤 Superuser created: ${newSuperuser.email}`);

    return newSuperuser;
  }

  /**
   * ✅ Obține un superuser după ID
   */
  static async getSuperuser(superuserId: string): Promise<Superuser | null> {
    ModuleMiddleware.ensureModuleActive("superusers");
    return await SuperuserRepository.getSuperuser(superuserId);
  }

  /**
   * ✅ Obține toți superuserii
   */
  static async getAllSuperusers(): Promise<Superuser[]> {
    ModuleMiddleware.ensureModuleActive("superusers");
    return await SuperuserRepository.getAllSuperusers();
  }

  /**
   * ✅ Șterge toți superuserii
   */
  static async deleteAllSuperusers(): Promise<void> {
    ModuleMiddleware.ensureModuleActive("superusers");

    await SuperuserRepository.deleteAllSuperusers();

    // 🔹 Emit event și log
    await EventService.emitEvent(EventTypes.ALL_SUPERUSERS_DELETED, {});
    await LoggerService.logInfo(`🗑️ All superusers deleted.`);
  }

  /**
   * ✅ Șterge un superuser după ID
   */
  static async deleteSuperuser(superuserId: string): Promise<void> {
    ModuleMiddleware.ensureModuleActive("superusers");

    await SuperuserRepository.deleteSuperuser(superuserId);

    // 🔹 Emit event și log
    await EventService.emitEvent(EventTypes.SUPERUSER_DELETED, { superuserId });
    await LoggerService.logInfo(`🗑️ Superuser deleted: ID ${superuserId}`);
  }

  /**
   * ✅ Clonează un superuser
   */
  static async cloneSuperuser(data: Partial<Superuser>): Promise<Superuser> {
    ModuleMiddleware.ensureModuleActive("superusers");

    if (!data.email || !data.fullName) {
      throw new BadRequestError('Missing required fields: email, fullName.');
    }

    const clonedSuperuser = await SuperuserRepository.cloneSuperuser(new Superuser(data));

    // 🔹 Emit event și log
    await EventService.emitEvent(EventTypes.SUPERUSER_CLONED, { superuserId: clonedSuperuser.id, email: clonedSuperuser.email });
    await LoggerService.logInfo(`🔄 Superuser cloned: ${clonedSuperuser.email}`);

    return clonedSuperuser;
  }
}

export default SuperuserService;
