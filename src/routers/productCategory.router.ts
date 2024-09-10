import { Router } from "express";
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
} from "../controllers/category.controller";

const productCategoryRouter = Router();
productCategoryRouter
  .post("/", createCategoryController)
  .get("/", getAllCategoriesController)
  .get("/:id", getCategoryByIdController);
export default productCategoryRouter;
