import persistenceService from "../services/PersistenceService"; // ✅ Instanța globală
import { Superuser } from "../models/superuserModel";
import LoggerService from "../services/LoggerService";
import { EventTypes } from "../events/EventTypes";
import EventService from "../services/EventService";

const SUPERUSER_COLLECTION = "superusers";

class SuperuserRepository {
  /**
   * ✅ Creează un superuser nou
   */
  static async createSuperuser(superuser: Superuser): Promise<Superuser> {
    try {
      const id = superuser.id || persistenceService.generateId(SUPERUSER_COLLECTION);
      const newSuperuser = { ...superuser, id };

      await persistenceService.createDocument(SUPERUSER_COLLECTION, id, newSuperuser);

      LoggerService.logInfo(`👤 Superuser created: ${newSuperuser.email}`);
      await EventService.emitEvent(EventTypes.SUPERUSER_SETUP, {
        superuserId: id,
        email: newSuperuser.email,
      });

      return new Superuser(newSuperuser);
    } catch (error) {
      LoggerService.logError("❌ Error creating superuser", error);
      throw new Error("Error creating superuser");
    }
  }

  /**
   * ✅ Obține un superuser după ID
   */
  static async getSuperuser(superuserId: string): Promise<Superuser | null> {
    try {
      const document = await persistenceService.getDocumentById(SUPERUSER_COLLECTION, superuserId);
      return document ? new Superuser(document) : null;
    } catch (error) {
      LoggerService.logError("❌ Error fetching superuser", error);
      throw new Error("Error fetching superuser");
    }
  }

  /**
   * ✅ Obține toți superuserii
   */
  static async getAllSuperusers(): Promise<Superuser[]> {
    try {
      const documents = await persistenceService.getAllDocuments(SUPERUSER_COLLECTION);
      return documents.map((doc) => new Superuser(doc));
    } catch (error) {
      LoggerService.logError("❌ Error fetching all superusers", error);
      throw new Error("Error fetching all superusers");
    }
  }

  /**
   * ✅ Șterge un superuser după ID
   */
  static async deleteSuperuser(superuserId: string): Promise<void> {
    try {
      await persistenceService.deleteDocument(SUPERUSER_COLLECTION, superuserId);

      LoggerService.logInfo(`🗑️ Superuser deleted: ID ${superuserId}`);
      await EventService.emitEvent(EventTypes.SUPERUSER_DELETED, { superuserId });
    } catch (error) {
      LoggerService.logError("❌ Error deleting superuser", error);
      throw new Error("Error deleting superuser");
    }
  }

  /**
   * ✅ Șterge toți superuserii
   */
  static async deleteAllSuperusers(): Promise<void> {
    try {
      await persistenceService.deleteAllDocuments(SUPERUSER_COLLECTION);

      LoggerService.logInfo(`🗑️ All superusers deleted`);
      await EventService.emitEvent(EventTypes.ALL_SUPERUSERS_DELETED, {});
    } catch (error) {
      LoggerService.logError("❌ Error deleting all superusers", error);
      throw new Error("Error deleting all superusers");
    }
  }

  /**
   * ✅ Clonează un superuser existent
   */
  static async cloneSuperuser(superuser: Superuser): Promise<Superuser> {
    try {
      const id = persistenceService.generateId(SUPERUSER_COLLECTION);
      const clonedSuperuser = {
        ...superuser,
        id,
        email: `clone_${superuser.email}`,
      };

      await persistenceService.createDocument(SUPERUSER_COLLECTION, id, clonedSuperuser);

      LoggerService.logInfo(`🔄 Superuser cloned: ${clonedSuperuser.email}`);
      await EventService.emitEvent(EventTypes.SUPERUSER_CLONED, {
        superuserId: id,
        email: clonedSuperuser.email,
      });

      return new Superuser(clonedSuperuser);
    } catch (error) {
      LoggerService.logError("❌ Error cloning superuser", error);
      throw new Error("Error cloning superuser");
    }
  }
}

export default SuperuserRepository;
