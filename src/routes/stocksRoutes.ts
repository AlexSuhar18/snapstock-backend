import express from "express";
import StocksController from "../controllers/stocksController";
import ValidateStockMiddleware from "../middlewares/validateStockData";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";

const router = express.Router();

// 🛡️ Aplicăm verificarea activării modulului și validarea input-ului
router.post(
  "/stocks",
  ModuleMiddleware.checkModule("stocks"),
  ValidateStockMiddleware.validateStockCreate,
  StocksController.createStock
);

router.get("/stocks", StocksController.getStocks);
router.get("/stocks/report", StocksController.getStockReport);
router.put(
  "/stocks/:id",
  ModuleMiddleware.checkModule("stocks"),
  ValidateStockMiddleware.validateStockUpdate,
  StocksController.updateStock
);
router.delete(
  "/stocks/:id",
  ModuleMiddleware.checkModule("stocks"),
  StocksController.deleteStock
);

export default router;
