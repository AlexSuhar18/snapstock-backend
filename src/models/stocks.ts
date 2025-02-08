import { adminDb } from "../config/firebase";
import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const STOCK_COLLECTION = "stocks";

export class Stock {
    id: string;
    name: string;
    quantity: number;
    price: number;
    minThreshold?: number;
    createdAt: string;
    updatedAt: string;
    location?: string;
    supplier?: string;
    lastRestocked: string;
    deletedAt?: string | null;
    notified?: boolean;

    constructor(data: any) {
        this.id = data.id || "";
        this.name = data.name;
        this.quantity = data.quantity;
        this.price = data.price;
        this.minThreshold = data.minThreshold;

        this.createdAt = data.createdAt ? Stock.formatTimestamp(data.createdAt) : Stock.formatTimestamp(Timestamp.now());
        this.updatedAt = data.updatedAt ? Stock.formatTimestamp(data.updatedAt) : Stock.formatTimestamp(Timestamp.now());
        this.lastRestocked = data.lastRestocked ? Stock.formatTimestamp(data.lastRestocked) : Stock.formatTimestamp(Timestamp.now());

        this.location = data.location || null;
        this.supplier = data.supplier || null;
        this.deletedAt = data.deletedAt || null;
        this.notified = data.notified ?? false;
    }

    async save(): Promise<void> {
        const stockRef = this.id 
            ? adminDb.collection(STOCK_COLLECTION).doc(this.id) 
            : adminDb.collection(STOCK_COLLECTION).doc(); // Dacă nu are ID, îl generează Firestore
    
        this.id = stockRef.id; // Asigură că id-ul este setat corect
        this.updatedAt = Stock.formatTimestamp(Timestamp.now());
    
        const stockData: any = { ...this, id: this.id }; // Adăugăm `id` în obiect
    
        await stockRef.set(stockData, { merge: true });
        console.log(`✅ Stock "${this.name}" saved successfully with ID: ${this.id}`);
    }    

    async updateQuantity(amount: number): Promise<void> {
        if (typeof amount !== "number" || isNaN(amount)) {
            throw new Error("Invalid quantity value");
        }

        this.quantity += amount;
        this.updatedAt = Stock.formatTimestamp(Timestamp.now());

        if (amount > 0) {
            this.lastRestocked = Stock.formatTimestamp(Timestamp.now());
        }

        await adminDb.collection(STOCK_COLLECTION).doc(this.id).update({
            quantity: this.quantity,
            updatedAt: this.updatedAt,
            lastRestocked: this.lastRestocked,
        });

        console.log(`✅ Stock "${this.name}" updated. New quantity: ${this.quantity}`);
    }

    async softDelete(): Promise<void> {
        const timestamp = Stock.formatTimestamp(Timestamp.now());
        await adminDb.collection(STOCK_COLLECTION).doc(this.id).update({
            deletedAt: timestamp,
            notified: false,
        });
        console.log(`🗑️ Stock "${this.name}" marked for deletion.`);
    }

    async undoDelete(): Promise<void> {
        await adminDb.collection(STOCK_COLLECTION).doc(this.id).update({
            deletedAt: null,
            notified: false,
        });
        console.log(`♻️ Stock "${this.name}" restored.`);
    }

    async deletePermanently(): Promise<void> {
        await adminDb.collection(STOCK_COLLECTION).doc(this.id).delete();
        console.log(`❌ Stock "${this.name}" permanently deleted.`);
    }

    static async getProductById(id: string): Promise<Stock | null> {
        const doc = await adminDb.collection(STOCK_COLLECTION).doc(id).get();
        if (!doc.exists) {
            console.warn(`❌ Product with ID ${id} not found.`);
            return null;
        }
        return new Stock({ id: doc.id, ...doc.data() });
    }

    static async getAllActiveProducts(): Promise<Stock[]> {
        const snapshot = await adminDb.collection(STOCK_COLLECTION).where("deletedAt", "==", null).get();
    
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return new Stock({ id: doc.id, ...data });
        });
    }    

    static async getDeletedStocks(): Promise<Stock[]> {
        const snapshot = await adminDb.collection(STOCK_COLLECTION).where("deletedAt", "!=", null).get();
        return snapshot.docs.map(doc => new Stock({ id: doc.id, ...doc.data() }));
    }

    static formatTimestamp(timestamp: any): string {
        if (!timestamp) return "N/A"; 

        if (timestamp instanceof admin.firestore.Timestamp) {
            return timestamp.toDate().toLocaleTimeString("ro-RO", { hour12: false }) + " " + timestamp.toDate().toLocaleDateString("ro-RO");
        }

        if (typeof timestamp === "object" && timestamp._seconds) {
            return new Date(timestamp._seconds * 1000).toLocaleTimeString("ro-RO", { hour12: false }) + " " +
                   new Date(timestamp._seconds * 1000).toLocaleDateString("ro-RO");
        }

        return new Date(timestamp).toLocaleTimeString("ro-RO", { hour12: false }) + " " + new Date(timestamp).toLocaleDateString("ro-RO");
    }
}

// ✅ Exporturi necesare pentru utilizarea în controllers
export const saveStock = async (data: any) => {
    const stock = new Stock(data);
    await stock.save();
};

export const updateStockQuantity = async (id: string, amount: number) => {
    const stock = await Stock.getProductById(id);
    if (!stock) throw new Error(`Product with ID ${id} not found.`);
    await stock.updateQuantity(amount);
};

export const softDeleteStock = async (id: string) => {
    const stock = await Stock.getProductById(id);
    if (!stock) throw new Error(`Product with ID ${id} not found.`);
    await stock.softDelete();
};

export const undoDeleteStock = async (id: string) => {
    const stock = await Stock.getProductById(id);
    if (!stock) throw new Error(`Product with ID ${id} not found.`);
    await stock.undoDelete();
};

export const deleteStockPermanently = async (id: string) => {
    const stock = await Stock.getProductById(id);
    if (!stock) throw new Error(`Product with ID ${id} not found.`);
    await stock.deletePermanently();
};

export const getAllActiveStocks = async (): Promise<Stock[]> => {
    return await Stock.getAllActiveProducts();
};

export const getDeletedStocks = async (): Promise<Stock[]> => {
    return await Stock.getDeletedStocks();
};

export const getProductById = async (id: string): Promise<Stock | null> => {
    return await Stock.getProductById(id);
};