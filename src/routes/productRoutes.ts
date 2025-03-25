import express from "express";
import ProductController from "../controllers/ProductController";
import ValidateProductMiddleware from "../middlewares/validateProductMiddleware";
import asyncHandler from "../middlewares/asyncHandler";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";

const router = express.Router();

// ✅ Middleware pentru activarea modulului "products"
const checkProductsModule = ModuleMiddleware.checkModule("products");

/**
 * @route   GET /api/products
 * @desc    Obține toate produsele
 */
router.get("/", checkProductsModule, asyncHandler(ProductController.getAllProducts));

/**
 * @route   POST /api/products
 * @desc    Creează un nou produs
 */
router.post(
  "/",
  checkProductsModule,
  ValidateProductMiddleware.validateCreate,
  asyncHandler(ProductController.createProduct)
);

/**
 * @route   GET /api/products/:id
 * @desc    Obține un produs după ID
 */
router.get("/:id", checkProductsModule, asyncHandler(ProductController.getProductById));

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizează un produs
 */
router.put(
  "/:id",
  checkProductsModule,
  ValidateProductMiddleware.validateUpdate,
  asyncHandler(ProductController.updateProduct)
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Șterge un produs (soft delete)
 */
router.delete("/:id", checkProductsModule, asyncHandler(ProductController.deleteProduct));

/**
 * @route   POST /api/products/:id/restore
 * @desc    Restaurează un produs șters
 */
router.post("/:id/restore", checkProductsModule, asyncHandler(ProductController.restoreProduct));

/**
 * @route   GET /api/products/deleted
 * @desc    Obține toate produsele șterse
 */
router.get("/deleted/all", checkProductsModule, asyncHandler(ProductController.getDeletedProducts));

/**
 * @route   DELETE /api/products/delete-multiple
 * @desc    Șterge mai multe produse după ID-uri
 */
router.delete("/delete-multiple", checkProductsModule, asyncHandler(ProductController.deleteMultipleProducts));

/**
 * @route   GET /api/products/report
 * @desc    Generează raport de produse
 */
router.get("/report/all", checkProductsModule, asyncHandler(ProductController.getProductReport));

export default router;
