import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

export const createJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, category, company, location, salary, experience, jobtype, skills, deadline } = req.body;
  const companyLogo = req.file?.path;
  
  if (!req.user?.id) {
    return next(new AppError("Unauthorized", 401));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Parse skills — may arrive as comma-separated string or array
  const parsedSkills = skills
    ? (Array.isArray(skills) ? skills : (skills as string).split(",").map((s: string) => s.trim()).filter(Boolean))
    : [];

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
    skills: parsedSkills,
    deadline: new Date(deadline),
    postedBy: { name: user.name, id: user._id }
  });

  res.status(201).json({ success: true, message: "Job created successfully", job });
});

export const getJobs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { location, jobtype, category, search, minSalary, maxSalary } = req.query;

  const activeJobFilter = {
    $or: [
      { deadline: { $gte: new Date() } },
      { deadline: { $exists: false } },
      { deadline: null }
    ]
  };

  const query: any = {
    ...activeJobFilter
  };
  
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }
  
  if (jobtype) {
    const typesArray = (jobtype as string).split(",");
    query.jobtype = { $in: typesArray };
  }

  if (category && category !== "All Categories") {
    query.category = category;
  }

  if (minSalary || maxSalary) {
    query.salary = {};
    if (minSalary) query.salary.$gte = Number(minSalary);
    if (maxSalary) query.salary.$lte = Number(maxSalary);
  }

  // Full-text search on title, company, and description
  if (search && (search as string).trim()) {
    const searchRegex = { $regex: (search as string).trim(), $options: "i" };
    query.$or = [
      { title: searchRegex },
      { company: searchRegex },
      { description: searchRegex },
    ];
  }

  const jobs = await Job.find(query).sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: "Jobs fetched successfully", jobs });
});

export const getRecommendedJobs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Unauthorized", 401));
  }

  const user = await User.findById(userId);

  const activeJobFilter = {
    $or: [
      { deadline: { $gte: new Date() } },
      { deadline: { $exists: false } },
      { deadline: null }
    ]
  };

  if (!user || !user.skills || user.skills.length === 0) {
    // Fallback: return latest 15 active jobs if no skills set
    const jobs = await Job.find(activeJobFilter).sort({ createdAt: -1 }).limit(15);
    return res.status(200).json({ success: true, jobs, isPersonalized: false, message: "Set up your skills profile to see personalized recommendations" });
  }

  // Match jobs where any of the candidate's skills appear in job skills, title, or description (case insensitive)
  const skillRegexes = user.skills.map(skill => new RegExp(skill, "i"));
  const jobs = await Job.find({
    $and: [
      activeJobFilter,
      {
        $or: [
          { skills: { $in: skillRegexes } },
          { title: { $in: skillRegexes } },
          { description: { $in: skillRegexes } }
        ]
      }
    ]
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, jobs, isPersonalized: true, message: `Found ${jobs.length} jobs matching your skills` });
});

export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await Job.distinct('category');
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

export const updateJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, description, category, company, location, salary, experience, jobtype, skills, deadline } = req.body;
  const companyLogo = req.file?.path;

  if (!id) {
    return next(new AppError("Job ID is required", 400));
  }

  const job = await Job.findById(id);
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // Verify ownership
  if (req.user?.id !== job.postedBy.id.toString()) {
    return next(new AppError("Not authorized to update this job", 403));
  }

  // Parse skills
  const parsedSkills = skills
    ? (Array.isArray(skills) ? skills : (skills as string).split(",").map((s: string) => s.trim()).filter(Boolean))
    : job.skills;

  // Update fields
  job.title = title || job.title;
  job.description = description || job.description;
  job.category = category || job.category;
  job.company = company || job.company;
  job.location = location || job.location;
  job.salary = salary || job.salary;
  job.experience = experience || job.experience;
  job.jobtype = jobtype || job.jobtype;
  job.skills = parsedSkills;
  if (deadline) job.deadline = new Date(deadline) as any;
  if (companyLogo) job.companyLogo = companyLogo;

  await job.save();

  res.status(200).json({ success: true, message: "Job updated successfully", job });
});


export const toggleBookmarkJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) return next(new AppError("Unauthorized", 401));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const jobIndex = user.savedJobs.indexOf(id as any);
  let isBookmarked = false;

  if (jobIndex > -1) {
    // Unbookmark
    user.savedJobs.splice(jobIndex, 1);
  } else {
    // Bookmark
    user.savedJobs.push(id as any);
    isBookmarked = true;
  }

  await user.save();
  res.status(200).json({ success: true, isBookmarked, message: isBookmarked ? "Job bookmarked" : "Job removed from bookmarks" });
});

export const getSavedJobs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError("Unauthorized", 401));

  const user = await User.findById(userId).populate({
    path: 'savedJobs',
    options: { sort: { createdAt: -1 } }
  });

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ success: true, jobs: user.savedJobs, message: "Saved jobs fetched successfully" });
});