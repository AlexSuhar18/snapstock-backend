import { Request, Response, NextFunction } from 'express';
import StockService from '../services/StockService';
import LoggerService from '../services/LoggerService';
import { NotFoundError, ForbiddenError } from '../errors/CustomErrors';

class StocksController {
  /**
   * ✅ Obține toate stocurile
   */
  async getStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const stocks = await StockService.getAllStocks();
      res.status(200).json(stocks);
    } catch (error) {
      LoggerService.logError('❌ Error fetching stocks', error);
      next(error);
    }
  }

  /**
   * ✅ Creează un nou stoc
   */
  async createStock(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.productId || !req.body.quantity || !req.body.location) {
        return res.status(400).json({ error: '❌ Missing required fields: productId, quantity, location' });
      }
      if (typeof req.body.quantity !== 'number' || req.body.quantity <= 0) {
        return res.status(400).json({ error: '❌ Quantity must be a positive number' });
      }

      const newStock = await StockService.createStock(req.body);
      res.status(201).json(newStock);
    } catch (error) {
      LoggerService.logError('❌ Error creating stock', error);
      next(error);
    }
  }

  /**
   * ✅ Obține un stoc după ID
   */
  async getStockById(req: Request, res: Response, next: NextFunction) {
    try {
      const stock = await StockService.getStockById(req.params.id); // 🔹 Înlocuit `getStockById` cu `getById`
      if (!stock) {
        throw new NotFoundError(`❌ Stock with ID ${req.params.id} not found`);
      }
      res.status(200).json(stock);
    } catch (error) {
      LoggerService.logError('❌ Error fetching stock by ID', error);
      next(error);
    }
  }

  /**
   * ✅ Actualizează un stoc existent
   */
  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const stock = await StockService.getStockById(req.params.id); // 🔹 Înlocuit `getStockById` cu `getById`
      if (!stock) {
        throw new NotFoundError(`❌ Stock with ID ${req.params.id} not found`);
      }

      const updatedStock = await StockService.updateStock(req.params.id, req.body);
      res.status(200).json(updatedStock);
    } catch (error) {
      LoggerService.logError('❌ Error updating stock', error);
      next(error);
    }
  }

  /**
   * ✅ Șterge un stoc
   */
  async deleteStock(req: Request, res: Response, next: NextFunction) {
    try {
      const userHasPermission = true; // 🔹 Înlocuiește cu o verificare reală a permisiunilor
      if (!userHasPermission) {
        throw new ForbiddenError('❌ You do not have permission to delete this stock');
      }

      const stock = await StockService.getStockById(req.params.id); // 🔹 Înlocuit `getStockById` cu `getById`
      if (!stock) {
        throw new NotFoundError(`❌ Stock with ID ${req.params.id} not found`);
      }

      await StockService.deleteStock(req.params.id);
      res.status(200).json({ message: '✅ Stock deleted successfully' });
    } catch (error) {
      LoggerService.logError('❌ Error deleting stock', error);
      next(error);
    }
  }

  /**
   * ✅ Obține un raport detaliat despre stocuri
   */
  async getStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      LoggerService.logInfo("📊 Generating stock report...");
      const stockReport = await StockService.generateStockReport();
      LoggerService.logInfo("✅ Stock report generated successfully.");
      res.status(200).json(stockReport);
    } catch (error) {
      LoggerService.logError("❌ Error generating stock report", error);
      next(error);
    }
  }
}

export default new StocksController();
