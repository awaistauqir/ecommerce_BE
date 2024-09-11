import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
} from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middelware";

const productsRouter = Router();
productsRouter
  .get("/", getAllProductsController)
  .get("/:id", getProductByIdController)
  .post("/", authMiddleware, authorizeRoles("admin"), createProductController)
  .delete("/:id", deleteProductController)
  .patch("/:id", updateProductController);

export default productsRouter;
