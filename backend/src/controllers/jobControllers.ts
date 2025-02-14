import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";

export const createJob = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
        const {title,description,company,location,salary,jobtype,postedBy} = req.body
        const job = new Job({title,description,company,location,salary,jobtype,postedBy})
        await job.save();
        return res.status(201).json({message:"Job created successfully", job});
})

export const getJobs = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
        const jobs = await Job.find();
        return res.status(201).json({message:"Jobs fetched successfully",jobs});
})