import express, { Application } from "express";
import dotenv from "dotenv";
import productsRouter from "./routers/product.router";
import { errorHandler } from "./middlewares/errorHandler";
import productCategoryRouter from "./routers/productCategory.router";
import authRouter from "./routers/auth.router";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use("/products", productsRouter);
app.use("/categories", productCategoryRouter);
app.use("/auth", authRouter);
app.get("/", (req, res) => {
  res.send("E-commerce Backend is running!");
});
app.use(errorHandler);
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found.", statusCode: 404 });
});
export default app;
