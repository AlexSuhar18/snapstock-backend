import express from 'express';
import { setupSuperuser, getSuperuserHandler, deleteSuperuserHandler, cloneSuperuserHandler } from '../controllers/superuserController';

const router = express.Router();

router.post('/setup-superuser', (req, res, next) => setupSuperuser(req, res, next).catch(next));
router.get('/superuser', (req, res, next) => getSuperuserHandler(req, res, next).catch(next));
router.post('/clone-superuser', (req, res, next) => cloneSuperuserHandler(req, res, next).catch(next));
router.delete('/debug-delete-superuser', (req, res, next) => deleteSuperuserHandler(req, res, next).catch(next));

export default router;