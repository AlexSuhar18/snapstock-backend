import express from "express";
import PluginController from "../controllers/PluginManagerController";
import ValidatePluginMiddleware from "../middlewares/validatePluginMiddleware";

const router = express.Router();

router.get("/", PluginController.getModules);
router.post("/enable/:moduleName", ValidatePluginMiddleware.validateModuleName, PluginController.enableModule);
router.post("/disable/:moduleName", ValidatePluginMiddleware.validateModuleName, PluginController.disableModule);
router.post("/reload", PluginController.reloadModules);

export default router;
