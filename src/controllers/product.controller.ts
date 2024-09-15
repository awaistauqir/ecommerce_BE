import { NextFunction, Request, Response } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  softDeleteProduct,
  updateProduct,
} from "../services/product.service";
import { z } from "zod";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../errors/CustomError";
import {
  productPaginationSchema,
  productSchema,
  updateProductSchema,
} from "../ZodSchemas/product.schema";

export const getAllProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = productPaginationSchema.parse(req.query);
    const products = await getAllProducts(validatedQuery);
    res.status(200).json(products);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid data", error.errors));
    } else next(error);
  }
};
export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const product = await getProductById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = productSchema.parse(req.body);
    const product = await createProduct(validatedData, req.user?.id as string);
    return res
      .status(201)
      .json({ data: product, message: "Product created successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid data", error.errors));
    } else next(error);
  }
};
export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await softDeleteProduct(id);
    if (!product) {
      // Product not found, throw NotFoundError
      throw new NotFoundError("Product not found");
    }
    // Respond with success message if product is successfully soft-deleted
    return res
      .status(204)
      .json({ message: "Product soft-deleted successfully" });
  } catch (error) {
    // Handle other errors (e.g., database errors)
    return next(error);
  }
};
export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);

    const updatedProduct = await updateProduct(id, validatedData);
    if (!updatedProduct) {
      throw new NotFoundError("Product not found or already deleted");
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError("Validation failed", error.errors));
    }

    return next(error);
  }
};
