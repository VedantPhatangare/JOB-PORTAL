import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";

export const apply = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {job_id} = req.params;
    const applicant_id = req.user?.id;
    if(! req.files){
        return res.status(400).json({message:"Resume is required to apply for a job"})
    }
    const files = req.files as  { [fieldname: string]: Express.Multer.File[] } | undefined;
    const resume = files?.resume[0].path;
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
        return res.status(404).json({message:"Job not found"})
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
    return res.status(201).json({message:"Application submitted successfully",application});
    console.log(application);
    
});
