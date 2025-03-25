import { Request, Response, NextFunction } from 'express';
import ProductService from '../services/ProductService';
import LoggerService from '../services/LoggerService';
import { NotFoundError, ForbiddenError } from '../errors/CustomErrors';

class ProductController {
  /**
   * ✅ Obține toate produsele
   */
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      LoggerService.logError('❌ Error fetching products', error);
      next(error);
    }
  }

  /**
   * ✅ Creează un nou produs
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await ProductService.createProduct(req.body);
      res.status(201).json(created);
    } catch (error) {
      LoggerService.logError('❌ Error creating product', error);
      next(error);
    }
  }

  /**
   * ✅ Obține un produs după ID
   */
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        throw new NotFoundError(`❌ Product with ID ${req.params.id} not found`);
      }
      res.status(200).json(product);
    } catch (error) {
      LoggerService.logError('❌ Error fetching product by ID', error);
      next(error);
    }
  }

  /**
   * ✅ Actualizează un produs existent
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        throw new NotFoundError(`❌ Product with ID ${req.params.id} not found`);
      }
      const updated = await ProductService.updateProduct(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      LoggerService.logError('❌ Error updating product', error);
      next(error);
    }
  }

  /**
   * ✅ Șterge un produs definitiv
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        throw new NotFoundError(`❌ Product with ID ${req.params.id} not found`);
      }
      await ProductService.deleteProduct(req.params.id);
      res.status(200).json({ message: '✅ Product deleted successfully' });
    } catch (error) {
      LoggerService.logError('❌ Error deleting product', error);
      next(error);
    }
  }

  /**
   * ✅ Ștergere soft
   */
  async softDeleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.softDeleteProduct(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      LoggerService.logError('❌ Error performing soft delete', error);
      next(error);
    }
  }

  /**
   * ✅ Restore produs soft-deleted
   */
  async restoreProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.restoreProduct(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      LoggerService.logError('❌ Error restoring product', error);
      next(error);
    }
  }

  /**
 * ✅ Șterge mai multe produse după o listă de ID-uri
 */
async deleteMultipleProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
  
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "❌ Product IDs list is required." });
      }
  
      const deletedProducts = await ProductService.deleteMultipleProducts(ids);
  
      res.status(200).json({
        message: "✅ Multiple products deleted successfully",
        count: deletedProducts.length,
        deleted: deletedProducts,
      });
    } catch (error) {
      LoggerService.logError("❌ Error deleting multiple products", error);
      next(error);
    }
  }  

  /**
   * ✅ Raport produse
   */
  async getProductReport(_req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ProductService.generateProductReport();
      res.status(200).json(report);
    } catch (error) {
      LoggerService.logError('❌ Error generating product report', error);
      next(error);
    }
  }

  /**
   * ✅ Caută produs după SKU
   */
  async findBySKU(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.findBySKU(req.params.sku);
      if (!result) {
        throw new NotFoundError(`❌ Product with SKU ${req.params.sku} not found`);
      }
      res.status(200).json(result);
    } catch (error) {
      LoggerService.logError('❌ Error finding product by SKU', error);
      next(error);
    }
  }

  /**
   * ✅ Obține toate produsele șterse logic
   */
  async getDeletedProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getDeletedProducts();
      res.status(200).json(result);
    } catch (error) {
      LoggerService.logError('❌ Error getting deleted products', error);
      next(error);
    }
  }
}

export default new ProductController();
