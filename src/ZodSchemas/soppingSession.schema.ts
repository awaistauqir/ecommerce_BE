import * as z from "zod";
export const createShoppingSessionSchema = z.object({
  userId: z
    .string({ message: "userId must be provided" })
    .uuid({ message: "user id is invalid" }),
});
export type ShoppingSessionSchema = z.infer<typeof createShoppingSessionSchema>;
export const addItemToCartSchema = z.object({
  userId: z
    .string({ message: "userId must be provided" })
    .uuid({ message: "user id is invalid" }),

  productId: z
    .string({ message: "productId must be provided" })
    .uuid({ message: "product id is invalid" }),

  quantity: z
    .number({ message: "quantity must be a positive integer" })
    .int({ message: "quantity must be an integer" })
    .nonnegative({ message: "quantity must be greater than 0" }),
});
export type AddItemToCartSchema = z.infer<typeof addItemToCartSchema>;
export const removeItemFromCartSchema = z.object({
  userId: z
    .string({ message: "userId must be provided" })
    .uuid({ message: "user id is invalid" }),
  cartItemId: z
    .string({ message: "cartItemId must be provided" })
    .uuid({ message: "cart item id is invalid" }),
});
export type RemoveItemFromCartSchema = z.infer<typeof removeItemFromCartSchema>;
export const updateCartItemQuantitySchema = z.object({
  userId: z
    .string({ message: "userId must be provided" })
    .uuid({ message: "user id is invalid" }),
  cartItemId: z
    .string({ message: "cartItemId must be provided" })
    .uuid({ message: "cart item id is invalid" }),
  quantity: z
    .number({ message: "quantity must be provided" })
    .min(1, "quantity must be greater than 0"),
});
