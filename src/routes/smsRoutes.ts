import { Router, Request, Response, NextFunction } from "express";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";
import SMSService from "../services/SMSService";

const router = Router();

// ✅ Middleware global pentru verificare modul activ
router.use(ModuleMiddleware.checkModule("sms"));

// 🔹 Endpoint pentru trimiterea SMS-urilor
router.post("/send", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      res.status(400).json({ message: "Phone number and message are required" });
      return;
    }

    const result = await SMSService.sendSMS(phoneNumber, message);

    res.status(200).json({ message: "SMS sent successfully", result });
  } catch (error) {
    next(error);
  }
});

export default router;
