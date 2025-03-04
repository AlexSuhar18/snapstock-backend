import express from "express";
import SuperuserController from "../controllers/superuserController";
import ValidateSuperuserMiddleware from "../middlewares/validateSuperuserMiddleware";

const router = express.Router();

router.post("/setup", ValidateSuperuserMiddleware.validateSetupSuperuser, SuperuserController.setupSuperuser);
router.get("/:superuserId", ValidateSuperuserMiddleware.validateGetSuperuser, SuperuserController.getSuperuser);
router.get("/", SuperuserController.getAllSuperusers);
router.delete("/", SuperuserController.deleteAllSuperusers);
router.delete("/:superuserId", ValidateSuperuserMiddleware.validateGetSuperuser, SuperuserController.deleteSuperuser);
router.post("/clone", ValidateSuperuserMiddleware.validateSetupSuperuser, SuperuserController.cloneSuperuser);

export default router;
