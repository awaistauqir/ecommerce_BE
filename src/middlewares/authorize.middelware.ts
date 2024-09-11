import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/CustomError";

// Define a type for the role object
type Role = string | { name: string };

// Extend the Express Request type to include the user property

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new ForbiddenError("Access denied. User not found.");
      }

      const userRoles = user.roles.map((role: Role) =>
        typeof role === "string" ? role.toLowerCase() : role.name.toLowerCase()
      );
      const normalizedAllowedRoles = allowedRoles.map((role) =>
        role.toLowerCase()
      );

      const hasRole = userRoles.some((role) =>
        normalizedAllowedRoles.includes(role)
      );

      if (!hasRole) {
        throw new ForbiddenError("Access denied. Insufficient permissions.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
