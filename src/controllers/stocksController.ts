import { Request, Response, NextFunction } from "express";
import { 
    saveStock, 
    updateStockQuantity, 
    softDeleteStock, 
    undoDeleteStock, 
    deleteStockPermanently, 
    getAllActiveStocks, 
    getDeletedStocks, 
    getProductById, 
    Stock
} from "../models/stocks";
import { adminDb } from "../config/firebase";

// ✅ GET all active products
export const getAllProductsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stocks = await getAllActiveStocks();
        if (stocks.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        res.status(200).json(stocks);
    } catch (error) {
        console.error("🚨 Error getting products:", error);
        next(error);
    }
};

// ✅ GET all deleted products (pentru undo delete)
export const getDeletedProductsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedStocks = await getDeletedStocks();
        if (deletedStocks.length === 0) {
            return res.status(404).json({ message: "No deleted products found" });
        }
        res.status(200).json(deletedStocks);
    } catch (error) {
        console.error("🚨 Error getting deleted products:", error);
        next(error);
    }
};

// ✅ GET stock by ID
export const getProductsByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stock = await getProductById(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(stock);
    } catch (error) {
        console.error("🚨 Error getting product", error);
        next(error);
    }
};

// ✅ POST: Create a new stock
// ✅ POST: Create a new stock (cu verificare pentru duplicat)
export const createProductHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("📥 Received request to create product:", req.body);

        const { name, category, quantity, price, minThreshold, location } = req.body;

        // ✅ 1. Validare: Verificăm dacă toate câmpurile necesare sunt furnizate
        if (!name || !category || quantity === undefined || price === undefined) {
            return res.status(400).json({ message: "Missing required fields: name, category, quantity, price" });
        }

        if (typeof quantity !== "number" || typeof price !== "number") {
            return res.status(400).json({ message: "Invalid data types. Quantity and price must be numbers." });
        }

        // ✅ 2. Verificăm dacă există deja un produs cu același nume
        const existingProductSnapshot = await adminDb.collection("stocks").where("name", "==", name).get();
        if (!existingProductSnapshot.empty) {
            return res.status(400).json({ message: `Product with name ${name} already exists.` });
        }

        // ✅ 3. Creăm un nou produs doar dacă nu există deja
        const newProduct = new Stock({
            name,
            category,
            quantity,
            price,
            minThreshold: minThreshold || 10, // Default threshold
            location,
        });

        await newProduct.save();
        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        console.error("🚨 Error creating product:", error);
        next(error);
    }
};

// ✅ PATCH: Update stock quantity (permite și scădere)
export const updateProductQuantityHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { quantity } = req.body;

        if (quantity === undefined || typeof quantity !== "number") {
            return res.status(400).json({ message: "Missing or invalid field: quantity must be a number." });
        }

        let stock = await Stock.getProductById(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ✅ Verificăm dacă scăderea de stoc nu duce la cantitate negativă
        const newQuantity = stock.quantity + quantity;
        if (newQuantity < 0) {
            return res.status(400).json({ message: "Insufficient stock quantity. Cannot reduce below zero." });
        }

        // ✅ Facem update-ul cu noua valoare calculată
        await stock.updateQuantity(quantity);

        // ✅ Obținem din nou produsul actualizat
        stock = await Stock.getProductById(req.params.id);
        if (!stock) {
            return res.status(500).json({ message: "Error retrieving updated product." });
        }

        res.status(200).json({
            message: `Updated stock for "${stock.name}". New quantity: ${stock.quantity}`,
            stock
        });

    } catch (error) {
        console.error("🚨 Error updating product quantity:", error);
        next(error);
    }
};

// ✅ DELETE: Soft delete (marchează pentru ștergere)
export const softDeleteProductHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stock = await getProductById(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: "Product not found" });
        }
        await softDeleteStock(req.params.id);
        res.status(200).json({ message: `Product "${stock.name}" marked for deletion` });
    } catch (error) {
        console.error("🚨 Error marking product for deletion:", error);
        next(error);
    }
};

// ✅ UNDO DELETE: Restaurare produs șters
export const undoDeleteProductHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stock = await getProductById(req.params.id);
        if (!stock || !stock.deletedAt) {
            return res.status(404).json({ message: "Product not found or not marked for deletion" });
        }
        await undoDeleteStock(req.params.id);
        res.status(200).json({ message: `Product "${stock.name}" restored successfully` });
    } catch (error) {
        console.error("🚨 Error restoring product:", error);
        next(error);
    }
};

// ✅ DELETE multiple stocks
export const deleteMultipleProductsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: "Missing or invalid productIds array" });
        }

        console.log("📌 Products to delete:", productIds);

        const notFound: string[] = [];
        const alreadyDeleted: string[] = [];
        const markedForDeletion: string[] = [];

        await Promise.all(
            productIds.map(async (id) => {
                const product = await Stock.getProductById(id);
                
                if (!product) {
                    notFound.push(id);
                } else if (product.deletedAt) {
                    alreadyDeleted.push(id); // Produsul e deja marcat pentru ștergere
                } else {
                    await product.softDelete();
                    markedForDeletion.push(id);
                }
            })
        );

        if (notFound.length > 0 || alreadyDeleted.length > 0) {
            return res.status(207).json({
                message: "Some products were not processed",
                alreadyDeleted,
                notFound,
                markedForDeletion
            });
        }

        res.status(200).json({
            message: "Products marked for deletion successfully",
            markedForDeletion
        });

    } catch (error) {
        console.error("🚨 Error deleting multiple products:", error);
        next(error);
    }
};

// ✅ DELETE permanently
export const deletePermanentlyHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stock = await getProductById(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: "Product not found" });
        }
        await deleteStockPermanently(req.params.id);
        res.status(200).json({ message: `Product "${stock.name}" permanently deleted` });
    } catch (error) {
        console.error("🚨 Error permanently deleting product:", error);
        next(error);
    }
};
