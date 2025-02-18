import { Router } from 'express';
import EmailController from '../controllers/emailController';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';

const router = Router();

router.post('/send-email', ModuleMiddleware.checkModule('emails'), (req, res, next) => EmailController.sendEmail(req, res, next));

export default router;
