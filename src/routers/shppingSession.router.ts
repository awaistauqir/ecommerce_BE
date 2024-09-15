import { Router } from "express";
import {
  addItemToCartController,
  createOrUpdateCartController,
  removeItemFromCartController,
  updateCartItemQuantityController,
} from "../controllers/cart.controller";

const cartRouter = Router();

cartRouter
  .get("/:userId", createOrUpdateCartController)
  .post("/add-item", addItemToCartController)
  .patch("/update-item-quantity", updateCartItemQuantityController)
  .delete("/remove-item", removeItemFromCartController);
export default cartRouter;
