import { Firestore } from "firebase-admin/firestore";
import { IDatabaseClient } from "./IDatabaseClient";
import FirebaseConfig from "../config/firebase";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

/**
 * ✅ Implementare Firestore pentru IDatabaseClient
 */
class FirestoreClient implements IDatabaseClient {
  private firestore: Firestore;

  constructor() {
    this.firestore = FirebaseConfig.getFirestore();
  }

  async getDocumentById(collection: string, id: string): Promise<any | null> {
    try {
      const doc = await this.firestore.collection(collection).doc(id).get();
      if (!doc.exists) return null;

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      LoggerService.logError(`❌ Error fetching document from ${collection} (ID: ${id})`, error);
      throw new Error("Error fetching document");
    }
  }

  async getAllDocuments(collection: string): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection(collection).get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      LoggerService.logError(`❌ Error fetching all documents from ${collection}`, error);
      throw new Error("Error fetching all documents");
    }
  }

  async getSingleDocumentByField(collection: string, field: string, value: any): Promise<any | null> {
    try {
      const querySnapshot = await this.firestore.collection(collection).where(field, "==", value).limit(1).get();
      
      if (querySnapshot.empty) {
        LoggerService.logInfo(`🔍 No document found in ${collection} where ${field} = ${value}`);
        return null;
      }
  
      const doc = querySnapshot.docs[0];
      const documentData = { id: doc.id, ...doc.data() };
  
      LoggerService.logInfo(`📄 Document found in ${collection} where ${field} = ${value}: ${doc.id}`);
      
      await EventService.emitEvent(EventTypes.DOCUMENT_QUERIED, { collection, field, value, documentId: doc.id })
        .catch(error => LoggerService.logError(`❌ Error emitting DOCUMENT_QUERIED event for ${collection}`, error));
  
      return documentData;
    } catch (error) {
      LoggerService.logError(`❌ Error querying document in ${collection} where ${field} = ${value}`, error);
      throw new Error("Error querying document by field");
    }
  }  

  async createDocument(collection: string, id: string, data: any): Promise<void> {
    try {
      await this.firestore.collection(collection).doc(id).set(data);
      LoggerService.logInfo(`📄 Document created in ${collection}: ${id}`);
      await EventService.emitEvent(EventTypes.DOCUMENT_CREATED, { collection, documentId: id });
    } catch (error) {
      LoggerService.logError(`❌ Error creating document in ${collection} (ID: ${id})`, error);
      throw new Error("Error creating document");
    }
  }

  async updateDocument(collection: string, id: string, data: Partial<any>): Promise<void> {
    try {
      await this.firestore.collection(collection).doc(id).update(data);
      LoggerService.logInfo(`📝 Document updated in ${collection}: ${id}`);
      await EventService.emitEvent(EventTypes.DOCUMENT_UPDATED, { collection, documentId: id });
    } catch (error) {
      LoggerService.logError(`❌ Error updating document in ${collection} (ID: ${id})`, error);
      throw new Error("Error updating document");
    }
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    try {
      await this.firestore.collection(collection).doc(id).delete();
      LoggerService.logInfo(`🗑️ Document deleted from ${collection}: ${id}`);
      await EventService.emitEvent(EventTypes.DOCUMENT_DELETED, { collection, documentId: id });
    } catch (error) {
      LoggerService.logError(`❌ Error deleting document from ${collection} (ID: ${id})`, error);
      throw new Error("Error deleting document");
    }
  }

  /**
   * ✅ Generează un ID unic pentru un document nou
   */
  generateId(collection: string): string {
    try {
      const id = this.firestore.collection(collection).doc().id;
      LoggerService.logInfo(`🔑 Generated new ID for ${collection}: ${id}`);
      return id;
    } catch (error) {
      LoggerService.logError(`❌ Error generating ID for ${collection}`, error);
      throw new Error("Error generating ID");
    }
  }

  /**
   * ✅ Șterge toate documentele dintr-o colecție
   */
  async deleteAllDocuments(collection: string): Promise<void> {
    try {
      const snapshot = await this.firestore.collection(collection).get();
      if (snapshot.empty) return;

      const batch = this.firestore.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      LoggerService.logInfo(`🗑️ All documents deleted from ${collection}`);
      await EventService.emitEvent(EventTypes.ALL_DOCUMENTS_DELETED, { collection });
    } catch (error) {
      LoggerService.logError(`❌ Error deleting all documents from ${collection}`, error);
      throw new Error("Error deleting all documents");
    }
  }
}

export default FirestoreClient;
