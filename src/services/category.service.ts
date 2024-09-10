import { PrismaClient, ProductCategory } from "@prisma/client";
import { DuplicateEntityError } from "../errors/CustomError";
import prisma from "../../prisma/prisma";

export const createCategory = async (data: {
  name: string;
  desc?: string | null;
}): Promise<ProductCategory> => {
  const foundCategories = await prisma.productCategory.findFirst({
    where: {
      name: data.name,
    },
  });
  if (foundCategories) {
    throw new DuplicateEntityError(`Category ${data.name} already exists`);
  }
  return await prisma.productCategory.create({
    data,
  });
};
export const getAllCategories = async (): Promise<ProductCategory[]> => {
  return prisma.productCategory.findMany({
    where: { deletedAt: null },
  });
};
export const getCategoryById = async (
  id: string
): Promise<ProductCategory | null> => {
  return prisma.productCategory.findUnique({
    where: { id, deletedAt: null },
  });
};
