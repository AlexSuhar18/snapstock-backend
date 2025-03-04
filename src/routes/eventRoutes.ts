import express from "express";
import EventController from "../controllers/EventController";
import ValidateEventMiddleware from "../middlewares/validateEventMiddleware";

const router = express.Router();

router.post("/emit", ValidateEventMiddleware.validate, EventController.emitEvent);

export default router;
