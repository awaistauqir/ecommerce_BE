import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
} from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const productsRouter = Router();
productsRouter
  .get("/", getAllProductsController)
  .get("/:id", getProductByIdController)
  .post("/", authMiddleware, createProductController)
  .delete("/:id", deleteProductController)
  .patch("/:id", updateProductController);

export default productsRouter;
