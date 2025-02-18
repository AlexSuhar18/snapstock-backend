import { Router } from 'express';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';
import { SuperuserHandlers } from '../controllers/superuserController';

const router = Router();

// ✅ Middleware global pentru verificare modul activ
router.use(ModuleMiddleware.checkModule('superusers'));

// 🔹 Endpoints pentru gestionarea superuserilor
router.post('/', SuperuserHandlers.setupSuperuser);
router.get('/', SuperuserHandlers.getAllSuperusers);
router.get('/:id', SuperuserHandlers.getSuperuser);
router.delete('/', SuperuserHandlers.deleteAllSuperusers);
router.delete('/:id', SuperuserHandlers.deleteSuperuser);
router.post('/clone', SuperuserHandlers.cloneSuperuser);

export default router;
