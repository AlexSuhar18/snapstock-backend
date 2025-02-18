import { Router } from "express";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";
import ValidationController from "../controllers/ValidationController";

const router = Router();

// ✅ Middleware pentru activarea modulului validation
router.use(ModuleMiddleware.checkModule("validation"));

// 🔹 Endpoints pentru validare
router.post("/password", ValidationController.validatePassword);
router.post("/email", ValidationController.validateEmail);
router.post("/domain", ValidationController.validateDomain);
router.post("/duplicate-email", ValidationController.checkDuplicateEmail);

export default router;
