import persistenceService from "../services/PersistenceService";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import { IRepository } from "../Interfaces/IRepository";
import LoggerService from "../services/LoggerService";

abstract class FirestoreRepository<T extends Record<string, any>> implements IRepository<T> {
  protected db = persistenceService;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private ensureModuleActive(): void {
    ModuleMiddleware.ensureModuleActive(this.collectionName);
  }

  async getById(id: string): Promise<T | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Invalid document ID.");
    }
    this.ensureModuleActive();
    try {
      const document = await this.db.getDocumentById(this.collectionName, id);
      if (!document) {
        throw new Error(`Document with ID ${id} not found.`);
      }
      return document;
    } catch (error) {
      LoggerService.logError(`❌ Firestore error in getById: ${error}`);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    this.ensureModuleActive();
    try {
      return await this.db.getAllDocuments(this.collectionName);
    } catch (error) {
      LoggerService.logError(`❌ Firestore error in getAll: ${error}`);
      throw error;
    }
  }

  async create(data: T): Promise<T> {
    this.ensureModuleActive();
    try {
      const id = this.db.generateId(this.collectionName);
      const newData = { ...(data as any), id };

      await this.db.createDocument(this.collectionName, id, newData);
      await EventService.emitEvent(`${this.collectionName.toUpperCase()}_CREATED` as EventTypes, { id, ...(newData as any) });

      return newData as T;
    } catch (error) {
      LoggerService.logError(`❌ Firestore error in create: ${error}`);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Invalid document ID.");
    }
    this.ensureModuleActive();
    try {
      const existingDoc = await this.getById(id);
      if (!existingDoc) {
        throw new Error(`Document with ID ${id} not found.`);
      }

      await this.db.updateDocument(this.collectionName, id, data);
      const updatedDoc = await this.getById(id);
      if (!updatedDoc) {
        throw new Error(`Failed to retrieve document after update.`);
      }

      await EventService.emitEvent(`${this.collectionName.toUpperCase()}_UPDATED` as EventTypes, { id, ...(updatedDoc as any) });

      return updatedDoc as T;
    } catch (error) {
      LoggerService.logError(`❌ Firestore error in update: ${error}`);
      throw error;
    }
  }

  async delete(id: string): Promise<T | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Invalid document ID.");
    }
    this.ensureModuleActive();
    try {
      const document = await this.getById(id);
      if (!document) {
        LoggerService.logWarn(`⚠️ Attempted to delete non-existing document in ${this.collectionName}: ${id}`);
        return null;
      }

      await this.db.deleteDocument(this.collectionName, id);
      await EventService.emitEvent(`${this.collectionName.toUpperCase()}_DELETED` as EventTypes, { id });

      return document;
    } catch (error) {
      LoggerService.logError(`❌ Firestore error in delete: ${error}`);
      throw error;
    }
  }
}

export default FirestoreRepository;
