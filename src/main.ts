import app from "./config/server";
import stocksRouter from "./routes/stocksRouter";
import superuserRoutes from "./routes/superuserRoutes";
import express from "express";

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use(express.json());
app.use("/stocks", stocksRouter);
app.use("/admin", superuserRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
