import { Product } from "../models/ProductModel";
import ProductRepository from "../repositories/ProductRepository";
import LoggerService from "../services/LoggerService";
import EventService from "../services/EventService";
import { EventTypes } from "../events/EventTypes";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors";
import ProductValidationService from "../services/validation/ProductValidationService";

class ProductService {
  /**
   * ✅ Creează un produs nou cu validare și tracking
   */
  static async createProduct(data: Partial<Product>): Promise<Product> {
    try {
      ProductValidationService.validateCreateProduct(data);

      const existing = await ProductRepository.findBySKU(data.sku!);
      if (existing) {
        throw new BadRequestError(`❌ Product with SKU ${data.sku} already exists.`);
      }

      const product = new Product(data);
      const created = await ProductRepository.create(product);

      LoggerService.logInfo(`✅ Product created: ${product.name}`);
      return created;
    } catch (error) {
      LoggerService.logError("❌ Error creating product", error);
      throw error;
    }
  }

  /**
   * ✅ Actualizează un produs
   */
  static async updateProduct(id: string, updates: Partial<Product>, changedBy?: string): Promise<Product> {
    try {
      if (!id) throw new BadRequestError("Product ID is required.");
      ProductValidationService.validateUpdateProduct(updates);

      const updated = await ProductRepository.update(id, updates, changedBy);
      LoggerService.logInfo(`📝 Product updated: ID ${id}`);
      return updated;
    } catch (error) {
      LoggerService.logError("❌ Error updating product", error);
      throw error;
    }
  }

  /**
   * ✅ Obține toate produsele
   */
  static async getAllProducts(): Promise<Product[]> {
    return await ProductRepository.getAll();
  }

  /**
   * ✅ Obține un produs după ID
   */
  static async getProductById(id: string): Promise<Product> {
    if (!id) throw new BadRequestError("Product ID is required.");
    const product = await ProductRepository.getById(id);
    if (!product) throw new NotFoundError("Product not found.");
    return product;
  }

  /**
   * ✅ Obține un produs după SKU
   */
  static async getProductBySKU(sku: string): Promise<Product> {
    if (!sku) throw new BadRequestError("SKU is required.");
    const product = await ProductRepository.findBySKU(sku);
    if (!product) throw new NotFoundError("Product not found.");
    return product;
  }

  /**
   * ✅ Șterge definitiv un produs
   */
  static async deleteProduct(id: string): Promise<Product> {
    if (!id) throw new BadRequestError("Product ID is required.");
    const deleted = await ProductRepository.delete(id);
    LoggerService.logInfo(`🗑️ Product deleted: ID ${id}`);
    return deleted;
  }

  /**
   * ✅ Soft-delete
   */
  static async softDeleteProduct(id: string): Promise<Product> {
    if (!id) throw new BadRequestError("Product ID is required.");
    return await ProductRepository.softDelete(id);
  }

  /**
   * ✅ Restore
   */
  static async restoreProduct(id: string): Promise<Product> {
    if (!id) throw new BadRequestError("Product ID is required.");
    return await ProductRepository.restore(id);
  }

  /**
   * ✅ Returnează toate produsele șterse (soft)
   */
  static async getDeletedProducts(): Promise<Product[]> {
    return await ProductRepository.getDeletedProducts();
  }

  /**
   * ✅ Returnează un raport de stocuri
   */
  static async generateProductReport() {
    const report = await ProductRepository.getProductReport();
    await EventService.emitEvent(EventTypes.STOCK_REPORT_GENERATED, {
      reportGeneratedAt: new Date().toISOString(),
    });
    return report;
  }

  /**
   * ✅ Șterge multiple produse
   */
  static async deleteMultipleProducts(ids: string[]): Promise<Product[]> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestError("❌ List of product IDs is required.");
    }

    const deleted = await ProductRepository.deleteMultiple(ids);
    LoggerService.logInfo(`🗑️ Deleted ${deleted.length} products.`);
    return deleted;
  }

  /**
   * ✅ Obține produse după categorie
   */
  static async getProductsByCategory(category: string): Promise<Product[]> {
    if (!category) throw new BadRequestError("Category is required.");
    return await ProductRepository.findByCategory(category);
  }

  /**
   * ✅ Obține produse după furnizor
   */
  static async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    if (!supplierId) throw new BadRequestError("Supplier ID is required.");
    return await ProductRepository.findBySupplier(supplierId);
  }

  static async findBySKU(sku: string): Promise<Product | null> {
    if (!sku || typeof sku !== "string") {
      throw new BadRequestError("Invalid SKU format.");
    }
  
    const product = await ProductRepository.findBySKU(sku);
    if (!product) {
      LoggerService.logWarn(`⚠️ No product found with SKU: ${sku}`);
      return null;
    }
  
    LoggerService.logInfo(`✅ Product fetched by SKU: ${sku}`);
    return product;
  }
  
}

export default ProductService;
