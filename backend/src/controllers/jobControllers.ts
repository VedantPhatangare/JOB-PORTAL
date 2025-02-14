import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import { UserPayload } from "../types/userPayload.js";

export const createJob = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
        const {title,description,company,location,salary,jobtype} = req.body
        const {id}= req.user as UserPayload;
        const job = new Job({title,description,company,location,salary,jobtype,postedBy:id})
        await job.save();
        return res.status(201).json({message:"Job created successfully", job});
})

export const getJobs = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
        const jobs = await Job.find();
        return res.status(201).json({message:"Jobs fetched successfully",jobs});
})