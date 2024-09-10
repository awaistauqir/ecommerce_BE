// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from "express";
import { BadRequestError, CustomError } from "../errors/CustomError";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error | CustomError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.statusCode,
      ...(err instanceof BadRequestError && {
        details: err.details,
      }),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      details: err.errors,
      status: 500,
    });
  }

  return res.status(500).json({
    message: "Something went wrong",
    status: 500,
  });
};
