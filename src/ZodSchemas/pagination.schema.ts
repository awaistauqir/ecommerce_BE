import { z } from "zod";
const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)) // Convert string to number, default to 1 if undefined
    .refine((val) => Number.isInteger(val), {
      message: "Page must be an integer",
    })
    .refine((val) => val > 0, {
      message: "Page must be a positive number",
    }),
  take: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)) // Convert string to number, default to 10 if undefined
    .refine((val) => Number.isInteger(val), {
      message: "Take must be an integer",
    })
    .refine((val) => val > 0, {
      message: "Take must be a positive number",
    }),
  order: z
    .string()
    .optional()
    .transform((val) => val?.toUpperCase() || "ASC") // Default to 'ASC'
    .refine((val) => ["ASC", "DESC"].includes(val), {
      message: "Order must be either 'ASC' or 'DESC'",
    }),
});

export default paginationSchema;
