import { Router } from 'express';
import EventController from '../controllers/EventController';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';

const router = Router();

router.post('/emit', ModuleMiddleware.checkModule('events'), EventController.emitEvent);

export default router;
