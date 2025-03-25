import persistenceService from "../services/PersistenceService";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

abstract class BaseRepository<T> {
  protected db = persistenceService;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async getById(id: string): Promise<T> {
    ModuleMiddleware.ensureModuleActive(this.collectionName);
    const document = await this.db.getDocumentById(this.collectionName, id);
    if (!document) throw new Error(`Document with ID ${id} not found.`);
    return document as T;
  }

  async getAll(): Promise<T[]> {
    ModuleMiddleware.ensureModuleActive(this.collectionName);
    return await this.db.getAllDocuments(this.collectionName);
  }

    /**
   * ✅ Obține toate documentele care conțin o anumită valoare pentru un câmp specific
   */
    async getAllByField(field: string, value: any): Promise<T[]> {
      ModuleMiddleware.ensureModuleActive(this.collectionName);
  
      if (!field || typeof field !== "string") {
        throw new Error("Invalid field name provided.");
      }
  
      const allDocuments = await this.getAll();
  
      return allDocuments.filter((doc: any) => doc[field] === value);
    }  

  async getByField(field: string, value: any): Promise<T | null> {
    ModuleMiddleware.ensureModuleActive(this.collectionName);
    if (!field || typeof field !== "string") {
      throw new Error("Invalid field name provided.");
    }
    const document = await this.db.getSingleDocumentByField(this.collectionName, field, value);
    return document as T | null;
  }

  async create(data: T): Promise<T> {
    ModuleMiddleware.ensureModuleActive(this.collectionName);
    
    // 🔹 Verifică dacă documentul există deja pentru a evita duplicatele
    const existingDocument = await this.getByField("id", (data as any).id);
    if (existingDocument) {
      throw new Error("A document with this ID already exists.");
    }

    const id = this.db.generateId(this.collectionName);
    const newData = { ...(data as any), id };

    await this.db.createDocument(this.collectionName, id, newData);
    await EventService.emitEvent(`${this.collectionName.toUpperCase()}_CREATED` as EventTypes, { id, ...(newData as any) });

    return await this.getById(id); // 🔹 Returnează documentul complet după inserare
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    ModuleMiddleware.ensureModuleActive(this.collectionName);
    await this.getById(id); // 🔹 Verifică dacă documentul există înainte de update

    if (!data || typeof data !== "object") {
      throw new Error("Invalid data for update.");
    }

    await this.db.updateDocument(this.collectionName, id, data);
    const updatedDoc = await this.getById(id);
    await EventService.emitEvent(`${this.collectionName.toUpperCase()}_UPDATED` as EventTypes, { id, ...(updatedDoc as any) });

    return updatedDoc as T;
  }

  async delete(id: string): Promise<T> {
    ModuleMiddleware.ensureModuleActive(this.collectionName);
    const document = await this.getById(id); // 🔹 Verifică dacă documentul există înainte de ștergere

    await this.db.deleteDocument(this.collectionName, id);
    await EventService.emitEvent(`${this.collectionName.toUpperCase()}_DELETED` as EventTypes, { id });

    return document;
  }

  async deleteMultiple(ids: string[]): Promise<T[]> {
    ModuleMiddleware.ensureModuleActive(this.collectionName);
    
    // 🔹 Verifică dacă lista de ID-uri este goală
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("IDs list cannot be empty.");
    }

    const deletedDocuments: T[] = [];

    for (const id of ids) {
      try {
        const document = await this.getById(id);
        if (document) {
          await this.db.deleteDocument(this.collectionName, id);
          deletedDocuments.push(document);
        }
      } catch (error) {
        // 🔹 Dacă documentul nu există, trecem la următorul
        console.warn(`⚠️ Document with ID ${id} not found and cannot be deleted.`);
      }
    }

    if (deletedDocuments.length > 0) {
      await EventService.emitEvent(`${this.collectionName.toUpperCase()}_DELETED_MULTIPLE` as EventTypes, {
        ids: deletedDocuments.map(doc => (doc as any).id), // 🔹 Emitere eveniment cu ID-urile șterse
      });
    }

    return deletedDocuments;
  }
}

export default BaseRepository;
