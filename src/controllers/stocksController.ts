import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { StockService } from "../services/StockService";
import { StockValidationService } from "../services/validation/StockValidationService";
import LoggerService from "../services/LoggerService";
import EventBus from "../events/EventBus";

/**
 * ✅ Controller pentru gestionarea stocurilor
 */
export class StockController {
    /**
     * ✅ Adaugă un nou produs în stoc
     */
    static createStock = asyncHandler(async (req: Request, res: Response) => {
        const { name, quantity, productId } = req.body;

        // 🔹 Validare date
        StockValidationService.validateCreateStock(req.body);

        const stock = await StockService.createStock({ name, quantity, productId });

        // 🔹 Emitere eveniment pentru tracking
        EventBus.emit("stock:created", { stockId: stock.id, name });

        LoggerService.logInfo(`📦 Stoc creat: ${name} (ID: ${stock.id})`);
        res.status(201).json({ message: "Stock created successfully", stock });
    });

    /**
     * ✅ Actualizează cantitatea unui produs
     */
    static updateStock = asyncHandler(async (req: Request, res: Response) => {
        const { stockId } = req.params;
        const { quantity } = req.body;

        StockValidationService.validateStockUpdate(req.body);
        
        const updatedStock = await StockService.updateStock(stockId, quantity);

        EventBus.emit("stock:updated", { stockId, quantity });
        LoggerService.logInfo(`📦 Stoc actualizat: ID ${stockId}, Nouă cantitate: ${quantity}`);

        res.status(200).json({ message: "Stock updated successfully", updatedStock });
    });

    /**
     * ✅ Obține toate produsele din stoc
     */
    static getAllStocks = asyncHandler(async (req: Request, res: Response) => {
        const stocks = await StockService.getAllStocks();
        res.status(200).json(stocks);
    });

    /**
     * ✅ Generare raport stocuri
     */
    static getStockReport = asyncHandler(async (req: Request, res: Response) => {
        const report = await StockService.generateStockReport();
        res.status(200).json(report);
    });

    /**
     * ✅ Șterge un produs din stoc
     */
    static deleteStock = asyncHandler(async (req: Request, res: Response) => {
        const { stockId } = req.params;
        await StockService.deleteStock(stockId);

        EventBus.emit("stock:deleted", { stockId });
        LoggerService.logInfo(`🗑️ Stoc șters: ID ${stockId}`);

        res.status(200).json({ message: "Stock deleted successfully" });
    });
}