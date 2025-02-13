import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'
import Jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
dotenv.config();
export const registerUser =asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    
    const {name,email,password,role} = req.body;
    const hashedPass = await bcrypt.hash(password,10);

    const newUser = new User({
        name,email,password:hashedPass,role
    })
    await newUser.save();

    res.status(201).json({message:"User registered successfully"});
});

export const loginUser = asyncHandler(async(req:Request,res:Response, next:NextFunction)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({message:"Invalid or Unregisterd Email"});
    }
    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        return res.status(400).json({message:"Invalid password"});
    }
    const token = Jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET!, {expiresIn:"1d"});
    return res.status(200).json({message:"User logged in successfully", token});
})
