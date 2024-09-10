import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/CustomError";
import { User } from "@prisma/client";

// Middleware to check user roles
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user || !user.roles) {
        throw new ForbiddenError("Access denied. No roles found.");
      }

      // Check if the user's roles include one of the allowed roles
      const hasRole = user.roles.some((role: { name: string }) =>
        allowedRoles.includes(role.name)
      );

      if (!hasRole) {
        throw new ForbiddenError("Access denied. Insufficient permissions.");
      }

      next(); // User is authorized, proceed to the next middleware
    } catch (error) {
      next(error); // Handle any errors
    }
  };
};
