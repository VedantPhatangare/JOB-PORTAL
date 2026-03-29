import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

export const createJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, category, company, location, salary, experience, jobtype } = req.body;
  const companyLogo = req.file?.path;
  
  if (!req.user?.id) {
    return next(new AppError("Unauthorized", 401));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const job = await Job.create({
    title,
    description,
    category,
    company,
    companyLogo,
    location,
    experience,
    salary,
    jobtype,
    postedBy: { name: user.name, id: user._id }
  });

  res.status(201).json({ success: true, message: "Job created successfully", job });
});

export const getJobs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { location, jobtype, category } = req.query;

  const query: any = {};
  
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }
  
  if (jobtype) {
    const typesArray = (jobtype as string).split(",");
    query.jobtype = { $in: typesArray };
  }

  // Exact match for the newly implemented category field
  if (category && category !== "All Categories") {
    query.category = category;
  }

  const jobs = await Job.find(query).sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: "Jobs fetched successfully", jobs });
});

export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Find all distinct categories that have been saved in the DB
  const categories = await Job.distinct('category');
  
  // Return the live categories. 
  // If undefined/empty, frontend will just fall back to standard ones or show none
  res.status(200).json({ success: true, message: "Categories fetched successfully", categories });
});

export const DeleteJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;
  
  if (!id) {
    return next(new AppError("Job ID is required", 400));
  }
  
  const deletedJob = await Job.findByIdAndDelete(id);
  
  if (!deletedJob) {
    return next(new AppError("Job not found", 404));
  }
  
  res.status(200).json({ success: true, message: "Job deleted successfully" });
});