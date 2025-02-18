export interface IDatabaseClient {
    getDocumentById(collection: string, id: string): Promise<any | null>;
    getAllDocuments(collection: string): Promise<any[]>;
    createDocument(collection: string, id: string, data: any): Promise<void>;
    updateDocument(collection: string, id: string, data: Partial<any>): Promise<void>;
    deleteDocument(collection: string, id: string): Promise<void>;
    generateId(collection: string): string;
    deleteAllDocuments(collection: string): Promise<void>;
  }
  