import { CartItem, ShoppingSession } from "@prisma/client";
import prisma from "../../prisma/prisma";
import { InternalServerError, NotFoundError } from "../errors/CustomError";

export async function getOrCreateSession(
  userId: string
): Promise<ShoppingSession> {
  try {
    const foundSession = await prisma.shoppingSession.findFirst({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true, // This will include the Product information in each CartItem
          },
        },
      },
    });
    if (foundSession != null) {
      return foundSession;
    }

    const session = await prisma.shoppingSession.create({
      data: { userId },
    });

    return session;
  } catch (error) {
    console.error("Error getting or creating shopping session:", error);
    throw new InternalServerError("Failed to get or create shopping session");
  }
}

export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItem> {
  const session = await getOrCreateSession(userId);
  const foundProduct = await prisma.product.findFirst({
    where: { id: productId },
  });
  if (!foundProduct) {
    throw new NotFoundError("Product not found");
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      sessionId: session.id,
      productId,
    },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    return prisma.cartItem.create({
      data: {
        sessionId: session.id,
        productId,
        quantity,
      },
    });
  }
}

export async function removeItemFromCart(
  userId: string,
  cartItemId: string
): Promise<void> {
  try {
    const session = await getOrCreateSession(userId);

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, sessionId: session.id },
    });

    if (!cartItem) {
      throw new NotFoundError("Cart item not found");
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error("Error removing item from cart:", error);
    throw new InternalServerError("Failed to remove item from cart");
  }
}
export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<ShoppingSession> {
  const session = await getOrCreateSession(userId);

  const updatedItem = await prisma.cartItem.updateMany({
    where: { id: cartItemId, sessionId: session.id },
    data: { quantity },
  });

  if (updatedItem.count === 0) {
    throw new NotFoundError("Cart item not found");
  }

  return session;
}
