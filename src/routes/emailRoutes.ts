import express from "express";
import EmailController from "../controllers/emailController";
import EmailValidationMiddleware from "../middlewares/EmailValidationMiddleware";
import ModuleMiddleware from "../middlewares/ModuleMiddleware";

const router = express.Router();

// Definim ruta cu validare + verificarea activării modulului
router.post(
  "/send-email",
  ModuleMiddleware.checkModule("email"),
  EmailValidationMiddleware.validateEmailFields,
  (req, res, next) => EmailController.sendEmail(req, res, next)
);

export default router;
