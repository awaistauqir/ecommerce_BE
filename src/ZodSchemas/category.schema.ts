import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ message: "name is required" })
    .min(2, "Name must be at least 2 characters long")
    .transform((val) => val.trim().toLowerCase()),
  description: z.string().optional(),
});
