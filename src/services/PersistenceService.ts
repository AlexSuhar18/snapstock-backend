import { IDatabaseClient } from "../database/IDatabaseClient";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

/**
 * ✅ Serviciu pentru interacțiunea cu baza de date (independent de Firestore).
 */
class PersistenceService {
  private dbClient: IDatabaseClient;

  constructor(dbClient: IDatabaseClient) {
    this.dbClient = dbClient;
  }

  /**
   * ✅ Obține un document după ID
   */
  public async getDocumentById(collection: string, id: string): Promise<any | null> {
    return await this.dbClient.getDocumentById(collection, id);
  }

  /**
   * ✅ Obține toate documentele dintr-o colecție
   */
  public async getAllDocuments(collection: string): Promise<any[]> {
    return await this.dbClient.getAllDocuments(collection);
  }

  /**
   * ✅ Creează un document nou într-o colecție
   */
  public async createDocument(collection: string, id: string, data: any): Promise<void> {
    await this.dbClient.createDocument(collection, id, data);
    await EventService.emitEvent(EventTypes.DOCUMENT_CREATED, { collection, documentId: id });
  }

  /**
   * ✅ Actualizează un document într-o colecție
   */
  public async updateDocument(collection: string, id: string, data: Partial<any>): Promise<void> {
    await this.dbClient.updateDocument(collection, id, data);
    await EventService.emitEvent(EventTypes.DOCUMENT_UPDATED, { collection, documentId: id });
  }

  /**
   * ✅ Șterge un document dintr-o colecție
   */
  public async deleteDocument(collection: string, id: string): Promise<void> {
    await this.dbClient.deleteDocument(collection, id);
    await EventService.emitEvent(EventTypes.DOCUMENT_DELETED, { collection, documentId: id });
  }

  /**
   * ✅ Șterge toate documentele dintr-o colecție
   */
  public async deleteAllDocuments(collection: string): Promise<void> {
    await this.dbClient.deleteAllDocuments(collection);
    await EventService.emitEvent(EventTypes.ALL_DOCUMENTS_DELETED, { collection });
  }

  /**
   * ✅ Generează un ID unic pentru un document nou
   */
  public generateId(collection: string): string {
    return this.dbClient.generateId(collection);
  }
}

// 🔹 Instanța globală care trebuie importată și utilizată
import FirestoreClient from "../database/FirestoreClient";
const persistenceService = new PersistenceService(new FirestoreClient());

export default persistenceService;
