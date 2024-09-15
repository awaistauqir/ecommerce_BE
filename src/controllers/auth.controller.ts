import { NextFunction, Request, Response } from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  signUp,
  verifyUser,
  changePassword,
} from "../services/auth.service";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from "../ZodSchemas/auth.schema";
import { ZodError } from "zod";
import { BadRequestError } from "../errors/CustomError";

export async function signupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedBody = signupSchema.parse(req.body);
    const user = await signUp(validatedBody);
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedBody = verifyEmailSchema.parse(req.body);
    const user = await verifyUser(validatedBody.token);
    return res
      .status(200)
      .json({ message: "User verified successfully", user });
  } catch (error) {
    next(error);
  }
}
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Login logic
    // Check the request body
    const validatedBody = loginSchema.parse(req.body);

    const user = await login(validatedBody.email, validatedBody.password);
    return res.status(200).json({ message: "Login successfull", ...user });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new BadRequestError("Invalid data", error.errors));
    } else next(error);
  }
}

export async function forgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    // Forgot password logic
    await forgotPassword(body.email);
    return res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new BadRequestError("Invalid data", error.errors));
    } else next(error);
  }
}
export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = resetPasswordSchema.parse(req.body);
    // Reset password logic
    await resetPassword(body);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new BadRequestError("Invalid data", error.errors));
    } else next(error);
  }
}
export async function changePasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedBody = changePasswordSchema.parse(req.body);
    // Change password logic
    const response = await changePassword(validatedBody, req.user!);
    res.status(200).json({
      message: "Password changed successfully",
      user: {
        id: response.id,
        email: response.email,
        name: response.name,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new BadRequestError("Invalid data", error.errors));
    } else next(error);
  }
}
