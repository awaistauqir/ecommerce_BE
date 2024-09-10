import { Request, Response, NextFunction } from "express";
import { verify, JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { UnauthorizedError } from "../errors/CustomError";
import prisma from "../../prisma/prisma";
import { Role, User } from "@prisma/client";

// Extend Express namespace to include user property on req object
interface UserWithRoles extends User {
  roles: Role[];
}
declare global {
  namespace Express {
    interface Request {
      user?: UserWithRoles; // You can also define a User type if needed
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for the authorization header and extract the token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization token is required");
    }

    const token = authHeader.split(" ")[1];

    // Verify the JWT token
    const decoded: any = verify(token, process.env.JWT_SECRET as string);

    if (!decoded || !decoded.id) {
      throw new UnauthorizedError("Invalid authorization token");
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid Session");
    }
    if (!user.isActive) {
      throw new UnauthorizedError("User is inactive");
    }
    if (!user.isEmailVerified) {
      throw new UnauthorizedError("Email is not verified");
    }
    if (
      user.passwordChangedAt &&
      new Date(user.passwordChangedAt) > new Date(decoded.iat * 1000)
    ) {
      throw new UnauthorizedError(
        "User recently changed password. Please login again"
      );
    }

    // Attach the user object to the req object
    req.user = user;

    // Store user data globally during request lifecycle using res.locals
    res.locals.user = user;

    // Continue to the next middleware/controller
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new UnauthorizedError("Token has expired"));
    } else if (error instanceof JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else {
      next(error);
    }
  }
};
