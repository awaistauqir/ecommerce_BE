import { z } from "zod";
export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"), // E.164 format
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type SignupSchema = z.infer<typeof signupSchema>;

export const verifyEmailSchema = z.object({
  token: z.string({ message: "Token is required" }),
});
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address"),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordScema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),

    confirmPassword: z.string(),
    token: z.string({ message: "reset token is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // The error will be shown on the confirmPassword field
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordScema>;
