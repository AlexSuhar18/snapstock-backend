export class Product {
    readonly id: string;
    name: string;
    sku: string;
    description?: string;
    barcode?: string;
    category?: string;
    brand?: string;
    supplierId?: string;

    price: number;
    costPrice?: number;
    currency: string;

    quantity: number;
    minThreshold?: number;
    maxThreshold?: number;

    unit: "pcs" | "kg" | "liters" | "meters" | "packs" | string;

    location?: string;
    warehouseId?: string;

    tags?: string[];
    imageUrl?: string;
    attachments?: string[];

    taxRate?: number;
    discount?: number;

    batchTrackingEnabled: boolean;
    expiryDate?: string;
    manufactureDate?: string;

    createdAt: string;
    updatedAt: string;
    deletedAt?: string;

    isActive: boolean;
    isArchived: boolean;
    notified?: boolean;

    history?: {
      timestamp: string;
      field: string;
      oldValue: any;
      newValue: any;
      changedBy?: string;
    }[];

    // 🔹 Extensii suplimentare pentru flexibilitate
    customAttributes?: Record<string, any>;
    metadata?: Record<string, any>;

    constructor(data: Partial<Product>) {
      this.id = data.id ?? crypto.randomUUID();
      this.name = data.name ?? "";
      this.sku = data.sku ?? "";
      this.description = data.description ?? "";
      this.barcode = data.barcode ?? "";
      this.category = data.category ?? "";
      this.brand = data.brand ?? "";
      this.supplierId = data.supplierId ?? "";

      this.price = data.price ?? 0;
      this.costPrice = data.costPrice ?? 0;
      this.currency = data.currency ?? "EUR";

      this.quantity = data.quantity ?? 0;
      this.minThreshold = data.minThreshold ?? 0;
      this.maxThreshold = data.maxThreshold ?? 99999;

      this.unit = data.unit ?? "pcs";

      this.location = data.location ?? "";
      this.warehouseId = data.warehouseId ?? "";

      this.tags = data.tags ?? [];
      this.imageUrl = data.imageUrl ?? "";
      this.attachments = data.attachments ?? [];

      this.taxRate = data.taxRate ?? 0;
      this.discount = data.discount ?? 0;

      this.batchTrackingEnabled = data.batchTrackingEnabled ?? false;
      this.expiryDate = data.expiryDate;
      this.manufactureDate = data.manufactureDate;

      this.createdAt = data.createdAt ?? new Date().toISOString();
      this.updatedAt = data.updatedAt ?? new Date().toISOString();
      this.deletedAt = data.deletedAt ?? undefined;

      this.isActive = data.isActive ?? true;
      this.isArchived = data.isArchived ?? false;
      this.notified = data.notified ?? false;

      this.history = data.history ?? [];

      this.customAttributes = data.customAttributes ?? {};
      this.metadata = data.metadata ?? {};
    }

    /**
     * ✅ Verifică dacă stocul este sub minim
     */
    isLowStock(): boolean {
      return this.quantity < (this.minThreshold ?? 0);
    }

    /**
     * ✅ Marcare ca șters (soft-delete)
     */
    softDelete(): void {
      this.deletedAt = new Date().toISOString();
      this.isActive = false;
    }

    /**
     * ✅ Restaurare produs șters
     */
    restore(): void {
      this.deletedAt = undefined;
      this.isActive = true;
    }

    /**
     * ✅ Înregistrează modificările în history
     */
    trackChanges(newData: Partial<Product>, changedBy?: string): void {
      const fieldsToTrack = [
        "name", "sku", "description", "barcode", "category", "brand",
        "supplierId", "price", "costPrice", "currency", "quantity",
        "minThreshold", "maxThreshold", "unit", "location", "warehouseId",
        "tags", "imageUrl", "attachments", "taxRate", "discount",
        "batchTrackingEnabled", "expiryDate", "manufactureDate",
        "isActive", "isArchived", "notified"
      ];

      for (const field of fieldsToTrack) {
        const oldValue = (this as any)[field];
        const newValue = (newData as any)[field];

        const isChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

        if (isChanged) {
          this.history?.push({
            timestamp: new Date().toISOString(),
            field,
            oldValue,
            newValue,
            changedBy,
          });

          (this as any)[field] = newValue;
        }
      }

      this.updatedAt = new Date().toISOString();
    }
  }
