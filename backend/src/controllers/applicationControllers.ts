import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { applyStatus } from "../types/applicationTypes.js";

export const apply = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {job_id} = req.params;
    const applicant_id = req.user?.id;
    if(req.user?.role=="Recruiter") return res.status(400).json({message:"please login as a candidate to apply"})
    if(! req.files){
        return res.status(400).json({message:"Resume is required to apply for a job"})
    }
    const files = req.files as  { [fieldname: string]: Express.Multer.File[] } | undefined;
    const resume = files?.resume[0].path;
    // console.log(resume);
    
    const coverletter = files?.coverletter?.[0].path;

    if(!job_id){
        return res.status(400).json({message:"Job id is required to apply for a job"})
    }
    if(!applicant_id){
        return res.status(400).json({message:"Applicant id is required to apply for a job"})
    }
    const job = await Job.findOne({_id: job_id});
    // console.log(job);
    
    if(!job){
        return res.status(404).json({message:"Job is either not found or removed"})
    }
    
    // await Application.findOneAndDelete({job_id,applicant_id});
    const existingApplication = await Application.findOne({job_id,applicant_id});
    
    if(existingApplication){
        return res.status(400).json({message:"You have already applied for this job"})
    }
    if(!resume){
        return res.status(400).json({message:"Resume is required to apply for a job"})
    }

    const application = new Application({
        job_id,
        applicant_id, 
        resume,
        coverletter: coverletter || undefined
    })

    await application.save();
    console.log(application);
    return res.status(201).json({message:"Application submitted successfully",application});
    
});


export const getApplicants = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const{job_id} = req.params;
    
    const applications = await Application.find({job_id})
    .populate('applicant_id','name email')
    .exec();

    return res.status(201).json({message:"applications fetched succesfully",applications})
});
export const getApplicant = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const{user_id,job_id} = req.body;
    
    const application = await Application.findOne({job_id,applicant_id :user_id})
    if (application) return res.status(200).json({success: true,message:"application fetched succesfully",application});
    else {
        return res.status(404).json({
            success: false,
            message: "No application found for the given user and job"
        });
    }
});

export const HireCandidate = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {status,job_id}:applyStatus = req.body;
    const {applicant_id} = req.params;
    console.log("hi",job_id,applicant_id);
    
    const application = await Application.findOneAndUpdate({applicant_id,job_id},{status});

    res.status(200).json({message:`applicant ${status} succesfully`,application})
})
