import { Product } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors/CustomError";
import prisma from "../../prisma/prisma";
import { CreateProductSchema } from "../ZodSchemas/product.schema";

interface Productpagination {
  page: number;
  take: number;
  order: string;
  orderBy?: string;
}

export const getAllProducts = async ({
  page,
  take,
  order,
  orderBy,
}: Productpagination) => {
  const skip = (page - 1) * take; // Calculate how many records to skip

  // Get the total count of products (ignoring pagination)
  const totalRecords = await prisma.product.count({
    where: { deletedAt: null },
  });

  // Get paginated products
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      createdBy: true,
    },
    skip: skip,
    take: take,
    orderBy: {
      [orderBy ? orderBy : "name"]: order.toLowerCase(), // Prisma expects 'asc' or 'desc'
    },
  });

  const totalPages = Math.ceil(totalRecords / take);

  return {
    data: products,
    meta: {
      totalRecords,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      take,
    },
  };
};
export const getProductById = async (id: string): Promise<Product | null> => {
  return await prisma.product.findUnique({
    where: { id },
  });
};
export const createProduct = async (
  data: CreateProductSchema,
  createdById: string
) => {
  const category = await prisma.productCategory.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }
  console.log(data, createdById);
  return await prisma.product.create({
    data: {
      ...data,
      createdById,
    },
  });
};

export const softDeleteProduct = async (
  id: string
): Promise<Product | null> => {
  // First, find the product by ID
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    // If the product does not exist, return null
    return null;
  }

  if (product.deletedAt) {
    // If the product is already deleted, throw BadRequestError
    throw new BadRequestError("Product is already deleted");
  }

  // Proceed with soft-deleting the product
  return await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
export const updateProduct = async (
  id: string,
  data: Partial<{
    name: string;
    description?: string;
    price: number;
    stock: number;
  }>
): Promise<Product | null> => {
  // Check if the product exists and is not deleted
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct || existingProduct.deletedAt) {
    // Return null if the product does not exist or is soft-deleted
    return null;
  }

  // Proceed with updating the product
  return await prisma.product.update({
    where: { id },
    data,
  });
};
