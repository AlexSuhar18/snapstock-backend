import { Product } from "../models/ProductModel";

export interface IProductService {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product>;
  findBySKU(sku: string): Promise<Product | null>;
  createProduct(data: Partial<Product>): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>, changedBy?: string): Promise<Product>;
  deleteProduct(id: string): Promise<Product>;
  deleteMultipleProducts(ids: string[]): Promise<Product[]>;
  restoreProduct(id: string): Promise<Product>;
  getDeletedProducts(): Promise<Product[]>;
  generateProductReport(): Promise<{
    total: number;
    active: Product[];
    lowStock: Product[];
  }>;
}
