import { NextFunction, Request, Response } from "express";
import {
  addItemToCartSchema,
  createShoppingSessionSchema,
  removeItemFromCartSchema,
} from "../ZodSchemas/soppingSession.schema";
import {
  addItemToCart,
  getOrCreateSession,
  removeItemFromCart,
} from "../services/shoppingSession.service";
import { BadRequestError } from "../errors/CustomError";
import { z } from "zod";

export async function createOrUpdateCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedBody = await createShoppingSessionSchema.parseAsync(
      req.params
    );
    const session = await getOrCreateSession(validatedBody.userId);
    return res.status(200).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid Data", error.errors));
    }
    next(error);
  }
}
export async function addItemToCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(req.body);
  try {
    const validatedBody = addItemToCartSchema.parse(req.body);
    const session = await addItemToCart(
      validatedBody.userId,
      validatedBody.productId,
      validatedBody.quantity
    );
    return res.status(200).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid Data", error.errors));
    }
    next(error);
  }
}
export async function removeItemFromCartController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedBody = await removeItemFromCartSchema.parseAsync(req.body);
    const session = await removeItemFromCart(
      validatedBody.userId,
      validatedBody.cartItemId
    );
    return res.status(200).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid Data", error.errors));
    }
    next(error);
  }
}
export async function updateCartItemQuantityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedBody = await addItemToCartSchema.parseAsync(req.body);
    const session = await addItemToCart(
      validatedBody.userId,
      validatedBody.productId,
      validatedBody.quantity
    );
    return res.status(200).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid Data", error.errors));
    }
    next(error);
  }
}
