export class Stock {
    id?: string;
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

    constructor({ id, name, quantity, price, minThreshold, createdAt, updatedAt, location, supplier, lastRestocked, deletedAt, notified }: Partial<Stock>) {
        this.id = id;
        this.name = name || "";
        this.quantity = quantity || 0;
        this.price = price || 0;
        this.minThreshold = minThreshold;
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
        this.lastRestocked = lastRestocked || new Date().toISOString();
        this.location = location ?? null;
        this.supplier = supplier ?? null;
        this.deletedAt = deletedAt ?? null;
        this.notified = notified ?? false;
    }
}
