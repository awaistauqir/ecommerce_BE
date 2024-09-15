import { PrismaClient, User } from "@prisma/client";
import {
  ChangePasswordSchema,
  ResetPasswordSchema,
  SignupSchema,
} from "../ZodSchemas/auth.schema";
import {
  BadRequestError,
  DuplicateEntityError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/CustomError";
import { sendForgotPasswordEmail, sendVerifyUserEmail } from "../utils/email";
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";
import { compare, hash } from "bcrypt";

const prisma = new PrismaClient();
const createTokenAsync = async (
  payload: Record<string, any>,
  expiresIn: string
): Promise<string> => {
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error("JWT secret is not defined in environment variables");
  }

  // Create token with 1 day expiration
  const token = await new Promise<string>((resolve, reject) => {
    sign(payload, secretKey, { expiresIn }, (err, encodedToken) => {
      if (err) {
        reject(err);
      } else if (encodedToken) {
        resolve(encodedToken);
      } else {
        reject(new Error("Failed to create token"));
      }
    });
  });

  return token;
};
export async function signUp(body: SignupSchema) {
  let user = await prisma.user.findFirst({ where: { email: body.email } });
  if (user) {
    throw new DuplicateEntityError("This email is in use");
  }
  user = await prisma.user.findFirst({ where: { phone: body.phone } });
  if (user) {
    throw new DuplicateEntityError("This phone number is in use");
  }
  const token = await createTokenAsync({ email: body.email }, "1d");
  const hashedPassword = await hash(body.password, 10);
  user = await prisma.user.create({
    data: {
      ...body,
      verificationToken: token,
      password: hashedPassword,
    },
  });
  // Create a token that expires in 1 day after creation

  try {
    sendVerifyUserEmail({
      to: body.email,
      subject: "Email Verification",
      text: `Please click on the link to verify your email: ${process.env.CLIENT_URL}/verify-email?token=${token}`,
      template: "emailVerification",
      context: {
        name: "emailVerification",
        verificationLink: `${process.env.CLIENT_URL}/verify-email?token=${token}`,
      },
    });
  } catch (error) {
    throw new InternalServerError("Failed to send verification email");
  }

  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}
export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.isEmailVerified) {
    throw new BadRequestError("Email is already verified");
  }

  // Generate a new token for email verification
  const newToken = await createTokenAsync({ email: user.email }, "1d");

  // Update the user's verification token in the database
  await prisma.user.update({
    where: { email: user.email },
    data: { verificationToken: newToken },
  });

  // Send the new verification email
  try {
    sendVerifyUserEmail({
      to: user.email,
      subject: "Email Verification",
      text: `Please click on the link to verify your email: ${process.env.CLIENT_URL}/verify-email?token=${newToken}`,
      template: "emailVerification",
      context: {
        name: user.name,
        verificationLink: `${process.env.CLIENT_URL}/verify-email?token=${newToken}`,
      },
    });
  } catch (error) {
    throw new InternalServerError("Failed to send verification email");
  }

  return { message: "A new verification email has been sent" };
}

export async function verifyUser(token: string) {
  // Verify user
  let email: string | undefined;
  try {
    const decoded = verify(token, process.env.JWT_SECRET as string);
    email = (decoded as any).email;
    if (!email) {
      throw new BadRequestError("Invalid verification token");
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.error("Token has expired");
      throw new BadRequestError(
        "Verification token has expired, request a new one."
      );
    } else if (error instanceof JsonWebTokenError) {
      console.error("Invalid token");
      throw new BadRequestError("Invalid verification token");
    } else {
      console.error("Unknown error", error);
      throw new InternalServerError(
        "An error occurred during user verification"
      );
    }
  }

  // Find user by email (assuming you're storing the user email in the token)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new BadRequestError("Email link is invalid");
  }

  // Check if the user is already verified
  if (user.isEmailVerified) {
    throw new BadRequestError("User is already verified");
  }

  // Update user to verified
  await prisma.user.update({
    where: { email },
    data: { isEmailVerified: true, verificationToken: null, isActive: true },
  });

  // Return the user
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
}
export async function login(email: string, password: string) {
  let user;
  user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    throw new NotFoundError("User with given email is not found");
  }
  if (!user.isEmailVerified) {
    throw new BadRequestError(
      "Email is not verified. Please verify your email before logging in"
    );
  }
  if (!user.isActive) {
    throw new UnauthorizedError(
      "Your account is restricted. Please contact support"
    );
  }
  // Check if the password is correct
  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }
  // Create a token with 7 day expiration
  const token = await createTokenAsync({ id: user.id }, "7d");
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export const forgotPassword = async (email: string): Promise<void> => {
  // 1. Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError("User with email does not exist");
  }

  if (!user.isActive) {
    throw new UnauthorizedError(
      "Your account is restricted. Please contact support"
    );
  }
  if (!user.isEmailVerified) {
    throw new BadRequestError(
      "Email is not verified. Please verify your email before resetting password"
    );
  }

  // 2. Generate a unique token
  const resetToken = await createTokenAsync({ email: email }, "1h");

  // 5. Save the token and expiration time to the database
  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: resetToken,
    },
  });

  // 6. Create a JWT to include the token for verification (optional)

  // 7. Prepare the email content
  const emailOptions = {
    to: user.email,
    subject: "Password Reset Request",
    template: "forgotPassword", // Your template name
    context: {
      name: user.name, // Include user's name if necessary
      resetLink: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`, // Frontend reset link with token
    },
  };

  // 8. Send the email
  try {
    await sendForgotPasswordEmail(emailOptions);
  } catch (error) {
    console.error("Failed to send email:", error);

    // Handle email sending failure (e.g., retry logic or alerting)
    throw new InternalServerError("Failed to send password reset email");
  }
};
export async function resetPassword(body: ResetPasswordSchema) {
  // 1. Verify the token
  const decoded = verify(body.token, process.env.JWT_SECRET as string);
  const email = (decoded as any).email;
  if (body.password !== body.confirmPassword) {
    throw new BadRequestError("Passwords do not match");
  }

  // 2. Find the user by email
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError("User with email does not exist");
  }

  if (!user.isActive) {
    throw new UnauthorizedError(
      "Your account is restricted. Please contact support"
    );
  }

  if (!user.isEmailVerified) {
    throw new BadRequestError(
      "Email is not verified. Please verify your email before resetting password"
    );
  }

  // 3. Check if the token is valid
  if (user.passwordResetToken !== body.token) {
    throw new BadRequestError("Invalid or expired token");
  }

  // 4. Hash the new password
  const hashedPassword = await hash(body.password, 10);

  // 5. Update the user's password
  user = await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordChangedAt: new Date(Date.now()),
    },
  });

  return user;
}

export async function changePassword(body: ChangePasswordSchema, user: User) {
  // 1. Check if the old password is correct
  const passwordMatch = await compare(body.oldPassword, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid password");
  }

  // 2. Validate new password
  if (body.oldPassword === body.newPassword) {
    throw new BadRequestError(
      "New password must be different from the old one"
    );
  }

  // 3. Hash the new password
  const hashedPassword = await hash(body.newPassword, 10);

  // 4. Update the user's password
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  return updatedUser;
}
