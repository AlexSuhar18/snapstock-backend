export class Stock {
    id: string;
    name: string;
    quantity: number;
    price: number;
    minThreshold?: number;
    createdAt: string;
    updatedAt: string;
    location?: string | null;
    supplier?: string | null;
    lastRestocked: string;
    deletedAt?: string | null;
    notified?: boolean;

    constructor(data: Partial<Stock>) {
        this.id = data.id || "";
        this.name = data.name || "";
        this.quantity = data.quantity || 0;
        this.price = data.price || 0;
        this.minThreshold = data.minThreshold;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.lastRestocked = data.lastRestocked || new Date().toISOString();
        
        // 🔹 Modificăm tipurile pentru a accepta null fără erori
        this.location = data.location ?? null;
        this.supplier = data.supplier ?? null;
        this.deletedAt = data.deletedAt ?? null;
        this.notified = data.notified ?? false;
    }
}