import { Response, Request, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers in dev environment
  if (process.env.NODE_ENV !== "production") {
    // console.error(err);
  }

  // Handle Mongoose cast error
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(", ")}`;
    error = new AppError(message, 400);
  }

  // Handle Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val: any) => val.message).join(", ");
    error = new AppError(message, 400);
  }

  // Handle Zod validation error
  if (err && err.name === "ZodError") {
    const message = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorMiddleware;