import { z } from "zod";
import paginationSchema from "./pagination.schema";

export const productSchema = z.object({
  name: z
    .string({ message: "name must be a string" })
    .min(3, "Name must be atleast 3 characters long")
    .transform((val) => val.trim()),
  description: z.string({ message: "name must be a string" }).optional(),
  price: z
    .number({ message: "price must be a number" })
    .positive({ message: "price must be positive number" }),
  stock: z
    .number({ message: "stock must a number" })
    .int({ message: "stock must a integer" })
    .nonnegative({ message: "stock must be non-negative" }),
  categoryId: z.string({ message: "category is required" }),
});
export type CreateProductSchema = z.infer<typeof productSchema>;
export const updateProductSchema = z.object({
  name: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? val.trim().toLowerCase() : val)),
  description: z.string().optional(),
  price: z
    .number()
    .positive({ message: "price must be a positive number" })
    .optional(),
  stock: z
    .number()
    .int()
    .nonnegative({ message: "stock must be a positve integer" })
    .optional(),
});

export const productPaginationSchema = paginationSchema.extend({
  orderBy: z
    .string()
    .optional()
    .default("name") // Default to 'name'
    .refine((val) => ["name", "price"].includes(val), {
      message: "OrderBy must be one of 'name' or 'price'",
    }),
});
