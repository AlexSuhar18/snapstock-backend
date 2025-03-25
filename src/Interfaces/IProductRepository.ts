import { Product } from "../models/ProductModel";

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  update(id: string, productData: Partial<Product>): Promise<Product>;
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product>;
  getBySKU(sku: string): Promise<Product | null>;
  getAllByField(field: string, value: any): Promise<Product[]>;
  delete(id: string): Promise<Product>;
  deleteMultiple(ids: string[]): Promise<Product[]>;
  softDelete(id: string): Promise<Product>;
  restore(id: string): Promise<Product>;
  getDeleted(): Promise<Product[]>;
  getProductReport(): Promise<{
    total: number;
    lowStock: Product[];
    active: Product[];
  }>;
}
