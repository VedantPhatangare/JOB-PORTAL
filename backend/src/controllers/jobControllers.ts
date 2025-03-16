import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";

export const createJob = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
        console.log(req.body)
        const {title,description,company,location,salary,jobtype} = req.body
        const id= req.user?.id
        const user = await User.findOne({_id:id})
        if(user){
                const {name,_id:id} = user
                const job = new Job({title,description,company,location,salary,jobtype,postedBy:{name,id}})
                await job.save();
                return res.status(201).json({message:"Job created successfully", job});
        }
})

export const getJobs = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
        const jobs = await Job.find();
        res.status(201).json({message:"Jobs fetched successfully",jobs});
        return;
});      
export const DeleteJob = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
        const {id} = req.body;
        await Job.findByIdAndDelete(id)
        res.status(201).json({message:"Job Deleted successfully"});
        return;
});      