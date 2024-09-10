import { Request, Response, NextFunction } from "express";
import { categorySchema } from "../ZodSchemas/category.schema";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
} from "../services/category.service";
import { BadRequestError, NotFoundError } from "../errors/CustomError";
import { z } from "zod";
export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const createdCategory = await createCategory(validatedData);
    return res.status(201).json({
      message: "Category created successfully",
      data: createdCategory,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Handle Zod validation errors
      return next(new BadRequestError("Validation failed", err.errors));
    }
    // Handle other unexpected errors
    return next(err);
  }
};
export const getAllCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getAllCategories();
    return res.status(200).json({
      data: categories,
    });
  } catch (err) {
    return next(err);
  }
};
export const getCategoryByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = req.params.id;
    const category = await getCategoryById(categoryId);
    if (!category) {
      throw new NotFoundError(`Product Category not found`);
    }
    return res.status(200).json({
      data: category,
    });
  } catch (err) {
    return next(err);
  }
};
