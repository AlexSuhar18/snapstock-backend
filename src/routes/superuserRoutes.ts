import express from 'express';
import { setupSuperuser, getSuperuserHandler, getAllSuperusersHandler, deleteAllSuperuserHandler, deleteSuperuserHandler, cloneSuperuserHandler } from '../controllers/superuserController';

const router = express.Router();

router.post('/setup-superuser', (req, res, next) => setupSuperuser(req, res, next).catch(next));
router.get('/superuser', (req, res, next) => getSuperuserHandler(req, res, next).catch(next));
router.get('/all-superusers', (req, res, next) => getAllSuperusersHandler(req, res, next).catch(next));
router.post('/clone-superuser', (req, res, next) => cloneSuperuserHandler(req, res, next).catch(next));
router.delete('/debug-delete-superuser', (req, res, next) => deleteAllSuperuserHandler(req, res, next).catch(next));
router.delete('/delete-superuser/:superuserId', (req, res, next) => deleteSuperuserHandler(req, res, next).catch(next));

export default router;