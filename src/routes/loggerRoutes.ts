import express from "express";
import LoggerController from "../controllers/LoggerController";
import ValidateLoggerMiddleware from "../middlewares/validateLoggerMiddleware";

const router = express.Router();

router.post("/info", ValidateLoggerMiddleware.validateLog, LoggerController.logInfo);
router.post("/error", ValidateLoggerMiddleware.validateLogError, LoggerController.logError);
router.post("/warn", ValidateLoggerMiddleware.validateLog, LoggerController.logWarn);
router.post("/debug", ValidateLoggerMiddleware.validateLog, LoggerController.logDebug);

export default router;
