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
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
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
    user: { 
      id: newUser._id, 
      name: newUser.name, 
      email: newUser.email, 
      role: newUser.role,
      skills: newUser.skills || [],
      bio: newUser.bio || "",
      profilePhoto: newUser.profilePhoto || "",
      resumeUrl: newUser.resumeUrl || "",
      experience: newUser.experience || "",
      education: newUser.education || "",
      companyName: newUser.companyName || "",
      companyWebsite: newUser.companyWebsite || "",
      companyDescription: newUser.companyDescription || "",
      companyLogo: newUser.companyLogo || "",
    },
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
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      skills: user.skills || [],
      bio: user.bio || "",
      profilePhoto: user.profilePhoto || "",
      resumeUrl: user.resumeUrl || "",
      experience: user.experience || "",
      education: user.education || "",
      companyName: user.companyName || "",
      companyWebsite: user.companyWebsite || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
    },
  });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = { httpOnly: true, secure: isProduction, sameSite: (isProduction ? "none" : "lax") as "none" | "lax" };
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

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
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Candidate fields
      skills: user.skills || [],
      bio: user.bio || "",
      profilePhoto: user.profilePhoto || "",
      resumeUrl: user.resumeUrl || "",
      experience: user.experience || "",
      education: user.education || "",
      // Recruiter fields
      companyName: user.companyName || "",
      companyWebsite: user.companyWebsite || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
    }
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId) {
    return next(new AppError("Unauthorized", 401));
  }

  const updateData: any = {};

  // Common fields
  if (req.body.name !== undefined) updateData.name = req.body.name;

  if (role === "Candidate") {
    const candidateFields = ["bio", "experience", "education", "resumeUrl"];
    candidateFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });
    // Handle skills array
    if (req.body.skills !== undefined) {
      updateData.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : req.body.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    // Handle uploaded profile photo and resume via fields
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files?.profileImage?.[0]) {
      updateData.profilePhoto = files.profileImage[0].path;
    }
    if (files?.resume?.[0]) {
      updateData.resumeUrl = files.resume[0].path;
    }
  } else if (role === "Recruiter") {
    const recruiterFields = ["companyName", "companyWebsite", "companyDescription"];
    recruiterFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files?.profileImage?.[0]) {
      updateData.companyLogo = files.profileImage[0].path;
    }
    if (req.file && !files?.profileImage) { // Fallback for single format if needed
      updateData.companyLogo = req.file.path;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password -refreshToken");

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      skills: updatedUser.skills || [],
      bio: updatedUser.bio || "",
      profilePhoto: updatedUser.profilePhoto || "",
      resumeUrl: updatedUser.resumeUrl || "",
      experience: updatedUser.experience || "",
      education: updatedUser.education || "",
      companyName: updatedUser.companyName || "",
      companyWebsite: updatedUser.companyWebsite || "",
      companyDescription: updatedUser.companyDescription || "",
      companyLogo: updatedUser.companyLogo || "",
    }
  });
});

export const getPublicProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password -refreshToken -appliedJobs -postedJobs");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills || [],
      bio: user.bio || "",
      profilePhoto: user.profilePhoto || "",
      experience: user.experience || "",
      education: user.education || "",
      companyName: user.companyName || "",
      companyWebsite: user.companyWebsite || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
    }
  });
});
