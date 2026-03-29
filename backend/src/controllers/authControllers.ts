import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const generateTokens = (id: string, role: string) => {
  const accessToken = Jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: "15m" });
  const refreshToken = Jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError(`Email already registered as ${existingUser.role}`, 400));
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPass,
    role,
  });

  const { accessToken, refreshToken } = generateTokens(newUser._id as string, newUser.role);
  newUser.refreshToken = refreshToken;
  await newUser.save({ validateBeforeSave: false });

  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (role && user.role !== role) {
    return next(new AppError(`Email already registered as ${user.role}`, 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError("Invalid email or password", 401));
  }

  const { accessToken, refreshToken } = generateTokens(user._id as string, user.role);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Clear refresh token from DB if user is logged in
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const refreshAuthToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return next(new AppError("unauthorized", 401));
  }

  try {
    const decoded = Jwt.verify(incomingRefreshToken, process.env.JWT_SECRET!) as { id: string };
    
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return next(new AppError("unauthorized", 401));
    }

    const { accessToken, refreshToken } = generateTokens(user._id as string, user.role);
    
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    return next(new AppError("Invalid refresh token", 401));
  }
});

export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError("unauthorized", 401));
  }
  
  const user = await User.findById(req.user.id).select("-password -refreshToken");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});
