import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types/reqTypes.js";
import { AppError } from "../utils/AppError.js";

const jwtVerify = (req: Request, res: Response, next: NextFunction): void => {
  // First check cookies for accessToken
  let token = req.cookies?.accessToken;
  
  // Fallback to Bearer token if not found in cookies (useful for testing/mobile)
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to get access.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as UserPayload;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired access token.", 401));
  }
};

export default jwtVerify;