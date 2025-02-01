import express from "express";
import stocksRouter from "../routes/stocksRouter";

const app = express();
app.use(express.json());

export default app;