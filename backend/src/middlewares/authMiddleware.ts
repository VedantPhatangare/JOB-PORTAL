import { NextFunction, Request, Response } from "express";
import jwt  from "jsonwebtoken";
import { UserPayload } from "../types/reqTypes.js";
const jwtVerify = (req:Request, res:Response, next:NextFunction):void=>{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        res.status(401).json({message:"Unauthorized access, token missing"});
        return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!); 
      req.user = decoded as UserPayload;
      console.log(req.user);
      next();
    } catch (error) {
        res.status(401).json({message:"Unauthorized access, invalid token"});
        return;
    }

}
export default jwtVerify;