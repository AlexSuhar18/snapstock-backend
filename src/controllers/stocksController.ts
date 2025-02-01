import { NextFunction, Request, Response } from "express";
import { addStock, getAllStocks, getStockById, updateStock, deleteStock, Stock } from "../models/stocks";

//POST /stocks - Add a new product
export const createStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productName, quantity } = req.body;

        if (!productName || typeof quantity !== "number") {
            res.status(400).json({ message: "Missing required information" });
            return;
        }

        const newStock: Stock = { productName, quantity };
        const stockId = await addStock(newStock);
        res.status(201).json({ id: stockId, ...newStock });
    } catch (error) {
        next(error);
    }
};

//GET /stocks - Get all products
export const getStocks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
       const stocks = await getAllStocks();
       res.json(stocks);
   } catch (error) {
       next(error);
   }
};

//GET /stocks/:id - Get a product by ID
export const getStockByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const stock = await getStockById(req.params.id);

        if (!stock) {
            res.status(404).json({ message: "Stock not found" });
            return;
        }
        res.json(stock);
    }   catch (error) {
        next(error);
    }
  };

  //PUT /stocks/:id - Update a product by ID
export const updateStockHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const { productName, quantity } = req.body;

        if (!productName || typeof quantity !== "number") {
            res.status(400).json({ message: "Missing or invalid required information" });
            return;
        }

        const success = await updateStock(req.params.id, req.body);

        if (!success) {
            res.status(404).json({ message: "Stock not found" });
            return;
        }
        res.json({ message: "Product updated successfully" });
    } catch (error) {
        next(error);
    }
};

//DELETE /stocks/:id - Delete a product by ID
export const deleteStockHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const success = await deleteStock(req.params.id);

        if (!success) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
