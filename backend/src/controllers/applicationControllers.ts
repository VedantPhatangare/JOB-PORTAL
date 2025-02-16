import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { applyStatus } from "../types/applicationTypes.js";
import path from "path";

export const apply = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {job_id} = req.params;
    const applicant_id = req.user?.id;
    if(! req.files){
        return res.status(400).json({message:"Resume is required to apply for a job"})
    }
    const files = req.files as  { [fieldname: string]: Express.Multer.File[] } | undefined;
    const resume = files?.resume[0].path;
    console.log(resume);
    
    const coverletter = files?.coverletter?.[0].path;

    if(!job_id){
        return res.status(400).json({message:"Job id is required to apply for a job"})
    };
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
    const role = req.user?.role;
    if(role != 'Recruiter'){
        return res.status(401).json({message:"please login as a recruiter"})
    }
    const applications = await Application.findById({_id:job_id});
    return res.status(201).json({message:"applications fetched succesfully",applications})
});

export const HireCandidate = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {status}:applyStatus = req.body;
    const {application_id} = req.params;

    const application = await Application.findByIdAndUpdate({_id:application_id},{status});
    res.status(200).json({message:`applicant ${status} succesfully`,application})
})
