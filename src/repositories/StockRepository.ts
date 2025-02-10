import FirebaseConfig from "../config/firebase";
import { Stock } from "../models/stocks";
import { Firestore } from "firebase-admin/firestore";

const db = FirebaseConfig.getFirestore();
const STOCK_COLLECTION = "stocks";

export class StockRepository {
    /**
     * ✅ Creează un nou stoc în Firestore
     */
    static async createStock(stockData: Stock): Promise<Stock> {
        const stockRef = db.collection(STOCK_COLLECTION).doc();
        stockData.id = stockRef.id; // 🔹 Asignăm ID-ul generat automat
        await stockRef.set(stockData);
        return stockData;
    }

    /**
     * ✅ Actualizează cantitatea unui stoc
     */
    static async updateStock(stockId: string, quantity: number): Promise<{ id: string; quantity: number }> {
        await db.collection(STOCK_COLLECTION).doc(stockId).update({
            quantity,
            updatedAt: new Date().toISOString(),
        });
        return { id: stockId, quantity };
    }

    /**
     * ✅ Obține toate stocurile active
     */
    static async getAllStocks(): Promise<Stock[]> {
        const snapshot = await db.collection(STOCK_COLLECTION).where("deletedAt", "==", null).get();
        return snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => new Stock({ id: doc.id, ...doc.data() }));
    }

    /**
     * ✅ Obține un stoc după ID
     */
    static async getStockById(stockId: string): Promise<Stock | null> {
        const doc = await db.collection(STOCK_COLLECTION).doc(stockId).get();
        return doc.exists ? new Stock({ id: doc.id, ...doc.data() }) : null;
    }

    /**
     * ✅ Marchează un stoc ca fiind șters (Soft Delete)
     */
    static async softDeleteStock(stockId: string): Promise<void> {
        await db.collection(STOCK_COLLECTION).doc(stockId).update({
            deletedAt: new Date().toISOString(),
            notified: false,
        });
    }

    /**
     * ✅ Restaurează un stoc șters
     */
    static async restoreStock(stockId: string): Promise<void> {
        await db.collection(STOCK_COLLECTION).doc(stockId).update({
            deletedAt: null,
            notified: false,
        });
    }

    /**
     * ✅ Șterge un stoc permanent
     */
    static async deleteStock(stockId: string): Promise<void> {
        await db.collection(STOCK_COLLECTION).doc(stockId).delete();
    }

    /**
     * ✅ Obține toate stocurile șterse (Soft Delete)
     */
    static async getDeletedStocks(): Promise<Stock[]> {
        const snapshot = await db.collection(STOCK_COLLECTION).where("deletedAt", "!=", null).get();
        return snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => new Stock({ id: doc.id, ...doc.data() }));
    }

    /**
     * ✅ Generează raport de stocuri
     */
    static async getStockReport(): Promise<{ totalItems: number; lowStockItems: Stock[] }> {
        const stocks = await this.getAllStocks();
        return {
            totalItems: stocks.length,
            lowStockItems: stocks.filter((stock) => stock.quantity < 10), // 🔹 Produse cu stoc redus
        };
    }
}