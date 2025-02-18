import { Router } from 'express';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';
import StocksController from '../controllers/stocksController';

const router = Router();

// ✅ Middleware global pentru verificare modul activ
router.use(ModuleMiddleware.checkModule('stocks'));

// 🔹 Endpoints pentru gestionarea stocurilor
router.get('/', StocksController.getStocks);
router.post('/', StocksController.createStock);
router.put('/:id', StocksController.updateStock);
router.delete('/:id', StocksController.deleteStock);
router.get('/report', StocksController.getStockReport);

export default router;
