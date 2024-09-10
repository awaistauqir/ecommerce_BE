import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  resetPasswordController,
  signupController,
  verifyEmailController,
} from "../controllers/auth.controller";

const authRouter = Router();
authRouter
  .post("/signup", signupController)
  .patch("/verify", verifyEmailController)
  .post("/login", loginController)
  .post("/forgotPassword", forgotPasswordController)
  .patch("/resetPassword", resetPasswordController);
export default authRouter;
