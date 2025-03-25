import { Product } from "../models/ProductModel";
import { IProductRepository } from "../Interfaces/IProductRepository";
import BaseRepository from "./BaseRepository";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";

class ProductRepository extends BaseRepository<Product> implements IProductRepository {
  constructor() {
    super("products");
  }

  async create(productData: Product): Promise<Product> {
    const createdProduct = await super.create(productData);
    LoggerService.logInfo(`📦 Product created: ${createdProduct.name} (SKU: ${createdProduct.sku})`);

    await EventService.emitEvent(EventTypes.DOCUMENT_CREATED, {
      collection: this.collectionName,
      documentId: createdProduct.id,
    });

    return createdProduct;
  }

  async update(id: string, data: Partial<Product>, changedBy?: string): Promise<Product> {
    const existingProduct = await this.getById(id);
    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    existingProduct.trackChanges(data, changedBy);

    const updatedProduct = await super.update(id, existingProduct);
    LoggerService.logInfo(`📝 Product updated: ${existingProduct.name} (ID: ${id})`);

    await EventService.emitEvent(EventTypes.DOCUMENT_UPDATED, {
      collection: this.collectionName,
      documentId: updatedProduct.id,
    });

    return updatedProduct;
  }

    /**
   * ✅ Obține un produs după SKU (alias pentru findBySKU)
   */
    async getBySKU(sku: string): Promise<Product | null> {
        if (!sku || typeof sku !== "string") {
          throw new Error("SKU must be a valid string.");
        }
    
        const product = await this.findBySKU(sku);
        if (!product) {
          LoggerService.logWarn(`⚠️ No product found with SKU: ${sku}`);
        }
    
        return product;
      }
    
      /**
       * ✅ Obține toate produsele șterse (soft-delete)
       */
      async getDeleted(): Promise<Product[]> {
        const allProducts = await this.getAll();
        const deletedProducts = allProducts.filter((product) => product.deletedAt !== undefined);
    
        LoggerService.logInfo(`📦 Retrieved ${deletedProducts.length} deleted products.`);
        return deletedProducts;
      }    

  async delete(id: string): Promise<Product> {
    const deletedProduct = await super.delete(id);

    await EventService.emitEvent(EventTypes.DOCUMENT_DELETED, {
      collection: this.collectionName,
      documentId: id,
    });

    LoggerService.logInfo(`🗑️ Product permanently deleted: ${deletedProduct.name}`);
    return deletedProduct;
  }

  async getAll(): Promise<Product[]> {
    return await super.getAll();
  }

  async getById(id: string): Promise<Product> {
    return await super.getById(id);
  }

  async findBySKU(sku: string): Promise<Product | null> {
    return await super.getByField("sku", sku);
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await super.getAllByField("category", category);
  }

  async findBySupplier(supplierId: string): Promise<Product[]> {
    return await super.getAllByField("supplierId", supplierId);
  }

  async softDelete(id: string): Promise<Product> {
    const product = await this.getById(id);
    product.softDelete();
    return await this.update(id, product);
  }

  async restore(id: string): Promise<Product> {
    const product = await this.getById(id);
    product.restore();
    return await this.update(id, product);
  }

  async getDeletedProducts(): Promise<Product[]> {
    const all = await this.getAll();
    return all.filter((p) => p.deletedAt !== undefined);
  }

  async getProductReport(): Promise<{
    total: number;
    lowStock: Product[];
    active: Product[];
  }> {
    const all = await this.getAll();
    return {
      total: all.length,
      active: all.filter((p) => p.isActive && !p.deletedAt),
      lowStock: all.filter((p) => p.isLowStock() && !p.deletedAt),
    };
  }

  async deleteMultiple(ids: string[]): Promise<Product[]> {
    const deleted: Product[] = [];
    for (const id of ids) {
      const item = await this.delete(id);
      deleted.push(item);
    }

    await EventService.emitEvent(EventTypes.ALL_DOCUMENTS_DELETED, {
      collection: this.collectionName,
    });

    return deleted;
  }
}

export default new ProductRepository();
