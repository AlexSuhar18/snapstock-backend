import { IDatabaseClient } from "../database/IDatabaseClient";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

class PersistenceService {
  private dbClient: IDatabaseClient;

  constructor(dbClient: IDatabaseClient) {
    this.dbClient = dbClient;
  }

  /**
   * ✅ Obține un document după ID
   */
  public async getDocumentById(collection: string, id: string): Promise<any | null> {
    const document = await this.dbClient.getDocumentById(collection, id);
    return document;
  }

  /**
   * ✅ Obține toate documentele dintr-o colecție
   */
  public async getAllDocuments(collection: string): Promise<any[]> {
    return await this.dbClient.getAllDocuments(collection);
  }

  /**
   * ✅ Obține un document pe baza unui câmp specific și emite un eveniment
   */
  public async getSingleDocumentByField(collection: string, field: string, value: any): Promise<any | null> {
    const document = await this.dbClient.getSingleDocumentByField(collection, field, value);

    await EventService.emitEvent(EventTypes.DOCUMENT_QUERIED, {
      collection,
      field,
      value,
      documentId: document.id // 🔹 Acum include și documentul găsit
    });

    return document;
  }

  /**
   * ✅ Creează un document și emite un eveniment
   */
  public async createDocument(collection: string, id: string, data: any): Promise<any> {
    await this.dbClient.createDocument(collection, id, data);
    
    await EventService.emitEvent(EventTypes.DOCUMENT_CREATED, { 
      collection, 
      documentId: id
    });

    return { id, ...data };
  }

  /**
   * ✅ Actualizează un document și emite un eveniment
   */
  public async updateDocument(collection: string, id: string, data: Partial<any>): Promise<any> {
    await this.dbClient.updateDocument(collection, id, data);

    const updatedDocument = await this.getDocumentById(collection, id);
    if (!updatedDocument) {
      throw new Error(`Failed to retrieve document after update: ${id}`);
    }

    await EventService.emitEvent(EventTypes.DOCUMENT_UPDATED, { 
      collection, 
      documentId: id
    });

    return updatedDocument;
  }

  /**
   * ✅ Șterge un document și emite un eveniment
   */
  public async deleteDocument(collection: string, id: string): Promise<void> {
    await this.dbClient.deleteDocument(collection, id);

    await EventService.emitEvent(EventTypes.DOCUMENT_DELETED, { 
      collection, 
      documentId: id 
    });
  }

  /**
   * ✅ Șterge toate documentele dintr-o colecție și emite un eveniment
   */
  public async deleteAllDocuments(collection: string): Promise<void> {
    await this.dbClient.deleteAllDocuments(collection);

    await EventService.emitEvent(EventTypes.ALL_DOCUMENTS_DELETED, { 
      collection 
    });
  }

  /**
   * ✅ Generează un ID unic pentru un document
   */
  public generateId(collection: string): string {
    return this.dbClient.generateId(collection);
  }
}

import FirestoreClient from "../database/FirestoreClient";
const persistenceService = new PersistenceService(new FirestoreClient());

export default persistenceService;
