import { Router, Request, Response, NextFunction } from 'express';
import MonitoringService from '../services/MonitoringService';
import ModuleMiddleware from '../middlewares/ModuleMiddleware';

const router = Router();

/**
 * ✅ Endpoint pentru trimiterea unui log extern
 */
router.post('/send-log', ModuleMiddleware.checkModule('monitoring'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventName, details } = req.body;

    if (!eventName) {
      res.status(400).json({ message: 'Event name is required' });
      return; // ✅ Asigură-te că returnezi aici pentru a evita continuarea execuției
    }

    await MonitoringService.sendLog(eventName, details); // ✅ Adaugă `await` dacă `sendLog` este async
    res.status(200).json({ message: `Log sent for event: ${eventName}` });
  } catch (error) {
    next(error); // ✅ Trimite eroarea către middleware-ul global de error handling
  }
});

export default router;
