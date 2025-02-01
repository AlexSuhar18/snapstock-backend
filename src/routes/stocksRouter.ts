import express from "express";
import { 
    createStock, 
    getStocks, 
    getStockByIdHandler, 
    updateStockHandler, 
    deleteStockHandler 
} from "../controllers/stocksController";

const router = express.Router();

// 🔹 POST /stocks - Add a new product
router.post("/", createStock);

// 🔹 GET /stocks - Get all products
router.get("/", getStocks);

// 🔹 GET /stocks/:id - Get product by ID
router.get("/:id", getStockByIdHandler);

// 🔹 PUT /stocks/:id - Update a product
router.put("/:id", updateStockHandler);

// 🔹 DELETE /stocks/:id - Delete a product
router.delete("/:id", deleteStockHandler);

export default router;
