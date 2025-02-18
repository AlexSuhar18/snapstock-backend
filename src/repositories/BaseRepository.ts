import PersistenceService from "../services/PersistenceService";
import PluginManager from "../core/PluginManager";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

/**
 * ✅ Clasă abstractă pentru accesarea datelor
 */
abstract class BaseRepository<T> {
  protected db: PersistenceService;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.db = PersistenceService.getFirestore(); // 🔹 Obținem instanța corectă
    this.collectionName = collectionName;
  }

  /**
   * ✅ Verifică dacă modul este activ înainte de a accesa datele
   */
  private ensureModuleActive(): void {
    if (!PluginManager.isModuleActive(this.collectionName)) {
      throw new Error(`${this.collectionName} module is disabled`);
    }
  }

  /**
   * ✅ Obține un document după ID
   */
  async getById(id: string): Promise<T | null> {
    this.ensureModuleActive();
    return this.db.getDocumentById(this.collectionName, id);
  }

  /**
   * ✅ Obține toate documentele din colecție
   */
  async getAll(): Promise<T[]> {
    this.ensureModuleActive();
    return this.db.getAllDocuments(this.collectionName);
  }

  /**
   * ✅ Obține un singur document pe baza unui câmp specific
   */
  async getByField(field: string, value: any): Promise<T | null> {
    this.ensureModuleActive();
    return this.db.getSingleDocumentByField(this.collectionName, field, value);
  }

  /**
   * ✅ Creează un document nou și emite un eveniment
   */
  async create(data: T): Promise<T> {
    this.ensureModuleActive();
    const id = this.db.generateId(this.collectionName);
    await this.db.createDocument(this.collectionName, id, data);
    await EventService.emitEvent(EventTypes.INVITATION_CREATED, { id, ...(data as any) });
    return { ...(data as any), id };
}

  /**
   * ✅ Actualizează un document existent și emite un eveniment
   */
  async update(id: string, data: Partial<T>): Promise<void> {
    this.ensureModuleActive();
    await this.db.updateDocument(this.collectionName, id, data);

    // 🔥 Emitere eveniment la update
    await EventService.emitEvent(EventTypes.INVITATION_UPDATED, { id, ...(data as any) });
  }

  /**
   * ✅ Șterge un document și emite un eveniment
   */
  async delete(id: string): Promise<void> {
    this.ensureModuleActive();
    await this.db.deleteDocument(this.collectionName, id);

    // 🔥 Emitere eveniment când un document este șters
    await EventService.emitEvent(EventTypes.INVITATION_DELETED, { inviteId: id });
  }
}

export default BaseRepository;
