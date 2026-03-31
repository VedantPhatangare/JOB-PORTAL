import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { applyStatus } from "../types/applicationTypes.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.model.js";
import { calculateMatchScore } from "../utils/resumeParser.js";

export const apply = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { job_id } = req.params;
  const applicant_id = req.user?.id;

  if (req.user?.role === "Recruiter") {
    return next(new AppError("Please login as a candidate to apply.", 403));
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const resume = files?.resume?.[0]?.path || req.body.resumeUrl;
  const coverletter = files?.coverletter?.[0]?.path;


  if (!job_id) {
    return next(new AppError("Job ID is required to apply for a job.", 400));
  }

  if (!applicant_id) {
    return next(new AppError("Unauthorized.", 401));
  }

  if (!resume) {
    return next(new AppError("Resume is required to apply for a job.", 400));
  }

  const job = await Job.findById(job_id);
  if (!job) {
    return next(new AppError("Job is either not found or removed.", 404));
  }

  const existingApplication = await Application.findOne({ job_id, applicant_id });
  if (existingApplication) {
    return next(new AppError("You have already applied for this job.", 400));
  }

  const candidate = await User.findById(applicant_id);
  
  // Calculate match score
  let matchScore = 0;
  if (resume) {
    try {
      matchScore = await calculateMatchScore(resume, candidate?.skills, {
        title: job.title,
        description: job.description,
        skills: job.skills
      });
    } catch (error) {
      console.error("Match score calculation failed:", error);
      matchScore = 0; // Fallback to 0 if ranking fails
    }
  }

  const application = await Application.create({
    job_id,
    applicant_id,
    resume,
    coverletter: coverletter || undefined,
    matchScore: matchScore || 0
  });

  res.status(201).json({ success: true, message: "Application submitted successfully", application });
});

export const getApplicants = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { job_id } = req.params;
  const job = await Job.findById(job_id).select("title description skills category");
  const applications = await Application.find({ job_id })
    .populate("applicant_id", "name email skills bio")
    .sort({ matchScore: -1 })
    .exec();

  res.status(200).json({ 
    success: true, 
    message: "Applications fetched successfully", 
    applications, 
    jobTitle: job?.title,
    jobDetails: {
      title: job?.title,
      description: job?.description,
      skills: job?.skills
    }
  });
});

export const getApplicant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user_id, job_id } = req.body;

  const application = await Application.findOne({ job_id, applicant_id: user_id });
  if (application) {
    return res.status(200).json({ success: true, message: "Application fetched successfully", application });
  } else {
    return next(new AppError("No application found for the given user and job", 404));
  }
});

export const HireCandidate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { status, job_id }: applyStatus = req.body;
  const { applicant_id } = req.params;

  const application = await Application.findOneAndUpdate(
    { applicant_id, job_id },
    { status },
    { new: true }
  );

  if (!application) {
    return next(new AppError("Application not found.", 404));
  }

  res.status(200).json({ success: true, message: `Applicant ${status} successfully`, application });
});

export const getAppliedJobs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const applicant_id = req.user?.id;

  if (!applicant_id) {
    return next(new AppError("Unauthorized.", 401));
  }

  const applications = await Application.find({ applicant_id })
    .populate("job_id", "title company location salary jobtype")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: "Applied jobs fetched successfully", applications });
});

export const withdrawApplication = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { job_id } = req.params;
  const applicant_id = req.user?.id;

  if (!applicant_id) {
    return next(new AppError("Unauthorized.", 401));
  }

  const application = await Application.findOneAndDelete({ job_id, applicant_id });

  if (!application) {
    return next(new AppError("Application not found or already withdrawn.", 404));
  }

  res.status(200).json({ success: true, message: "Application withdrawn successfully" });
});
