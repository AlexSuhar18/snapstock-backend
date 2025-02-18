import admin from "firebase-admin";
import { IRepository } from "./Interfaces/IRepository";
import LoggerService from "../services/LoggerService";
import PluginManager from "../core/PluginManager";

abstract class FirestoreRepository<T extends Record<string, any>> implements IRepository<T> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollection() {
    return admin.firestore().collection(this.collectionName);
  }

  async getById(id: string): Promise<T | null> {
    this.ensureModuleActive();

    try {
      const doc = await this.getCollection().doc(id).get();
      return doc.exists ? (doc.data() as T) : null;
    } catch (error) {
      LoggerService.logError(`❌ Error fetching document from ${this.collectionName}:`, error);
      throw new Error(`Error fetching document from ${this.collectionName}`);
    }
  }

  async getAll(): Promise<T[]> {
    this.ensureModuleActive();

    try {
      const snapshot = await this.getCollection().get();
      return snapshot.docs.map((doc) => doc.data() as T);
    } catch (error) {
      LoggerService.logError(`❌ Error fetching all documents from ${this.collectionName}:`, error);
      throw new Error(`Error fetching all documents from ${this.collectionName}`);
    }
  }

  async create(data: T): Promise<T> {
    this.ensureModuleActive();

    try {
      const docRef = this.getCollection().doc();
      await docRef.set(data);
      return { ...(data as any), id: docRef.id };
    } catch (error) {
      LoggerService.logError(`❌ Error creating document in ${this.collectionName}:`, error);
      throw new Error(`Error creating document in ${this.collectionName}`);
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    this.ensureModuleActive();

    try {
      await this.getCollection().doc(id).update(data);
    } catch (error) {
      LoggerService.logError(`❌ Error updating document in ${this.collectionName}:`, error);
      throw new Error(`Error updating document in ${this.collectionName}`);
    }
  }

  async delete(id: string): Promise<void> {
    this.ensureModuleActive();

    try {
      await this.getCollection().doc(id).delete();
    } catch (error) {
      LoggerService.logError(`❌ Error deleting document from ${this.collectionName}:`, error);
      throw new Error(`Error deleting document from ${this.collectionName}`);
    }
  }

  private ensureModuleActive() {
    if (!PluginManager.isModuleActive(this.collectionName)) {
      throw new Error(`${this.collectionName} module is disabled`);
    }
  }
}

export default FirestoreRepository;
