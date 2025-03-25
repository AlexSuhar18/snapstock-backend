export class Stock {
    id?: string;
    productId: string; // ✅ Adăugat productId pentru validare clară
    name: string;
    quantity: number;
    price: number;
    minThreshold?: number;
    createdAt?: string;
    updatedAt?: string;
    location?: string | null;
    supplier?: string | null;
    lastRestocked?: string;
    deletedAt?: string | null;
    notified?: boolean;

    constructor({ id, productId, name, quantity, price, minThreshold, createdAt, updatedAt, location, supplier, lastRestocked, deletedAt, notified }: Partial<Stock>) {
        if (!productId || typeof productId !== "string") {
            throw new Error("❌ productId is required and must be a string.");
        }
        if (!name || typeof name !== "string") {
            throw new Error("❌ name is required and must be a string.");
        }
        if (typeof quantity !== "number" || quantity < 0) {
            throw new Error("❌ quantity must be a non-negative number.");
        }
        if (typeof price !== "number" || price < 0) {
            throw new Error("❌ price must be a non-negative number.");
        }

        this.id = id;
        this.productId = productId;
        this.name = name;
        this.quantity = quantity;
        this.price = price;
        this.minThreshold = minThreshold ?? 5; // ✅ Prag implicit pentru alertă
        this.createdAt = createdAt ?? new Date().toISOString();
        this.updatedAt = updatedAt ?? new Date().toISOString();
        this.lastRestocked = lastRestocked || new Date().toISOString();
        this.location = location ?? null;
        this.supplier = supplier ?? null;
        this.deletedAt = deletedAt ?? null;
        this.notified = notified ?? false;
    }

    /**
     * ✅ Verifică dacă stocul este critic și returnează un boolean
     */
    isCriticalStock(): boolean {
        return this.quantity <= (this.minThreshold ?? 5);
    }
}
