import express from "express";
import ValidationController from "../controllers/ValidationController";
import ValidateInputMiddleware from "../middlewares/validateInputMiddleware";

const router = express.Router();

router.post("/password", ValidateInputMiddleware.validatePassword, ValidationController.validatePassword);
router.post("/email", ValidateInputMiddleware.validateEmail, ValidationController.validateEmail);
router.post("/domain", ValidateInputMiddleware.validateDomain, ValidationController.validateDomain);
router.post("/email/duplicate", ValidateInputMiddleware.validateEmail, ValidationController.checkDuplicateEmail);

export default router;
