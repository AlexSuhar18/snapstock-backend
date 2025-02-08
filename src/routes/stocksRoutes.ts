import express from "express";
import {
    getAllProductsHandler,
    getDeletedProductsHandler, // 🔹 Obține produsele șterse (pentru undo delete)
    getProductsByIdHandler,
    createProductHandler,
    updateProductQuantityHandler,
    softDeleteProductHandler, // 🔹 Soft delete (marcare pentru ștergere)
    undoDeleteProductHandler, // 🔹 Undo delete (restaurare produs)
    deleteMultipleProductsHandler,
    deletePermanentlyHandler, // 🔹 Ștergere finală (completă)
} from "../controllers/stocksController";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

router.get("/products", asyncHandler(getAllProductsHandler));
router.get("/products/deleted", asyncHandler(getDeletedProductsHandler));
router.get("/product/:id", asyncHandler(getProductsByIdHandler));
router.post("/products", asyncHandler(createProductHandler));
router.patch("/product/:id", asyncHandler(updateProductQuantityHandler));
router.patch("/product/:id/delete", asyncHandler(softDeleteProductHandler));
router.patch("/product/:id/restore", asyncHandler(undoDeleteProductHandler));
router.delete("/product/:id", asyncHandler(deletePermanentlyHandler));
router.delete("/products/delete-multiple", asyncHandler(deleteMultipleProductsHandler));

export default router;
