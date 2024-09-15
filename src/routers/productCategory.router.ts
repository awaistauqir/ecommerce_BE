import { Router } from "express";
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
} from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middelware";

const productCategoryRouter = Router();
productCategoryRouter
  .post("/", authMiddleware, authorizeRoles("admin"), createCategoryController)
  .get("/", getAllCategoriesController)
  .get("/:id", getCategoryByIdController);
export default productCategoryRouter;
