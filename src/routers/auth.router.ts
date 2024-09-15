import { Router } from "express";
import {
  changePasswordController,
  forgotPasswordController,
  loginController,
  resetPasswordController,
  signupController,
  verifyEmailController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRouter = Router();
authRouter
  .post("/signup", signupController)
  .patch("/verify", verifyEmailController)
  .post("/login", loginController)
  .post("/forgotPassword", forgotPasswordController)
  .patch("/resetPassword", resetPasswordController)
  .patch("/changePassword", authMiddleware, changePasswordController);
export default authRouter;
