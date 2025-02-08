import express from "express";
import stocksRouter from "../routes/stocksRoutes";

const app = express();
app.use(express.json());

export default app;
