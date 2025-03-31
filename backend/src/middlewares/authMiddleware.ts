import { NextFunction, Request, Response } from "express";
import jwt  from "jsonwebtoken";
import { UserPayload } from "../types/reqTypes.js";
const jwtVerify = (req:Request, res:Response, next:NextFunction):void=>{
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);
    
    try {
      if(token ){
          const decoded = jwt.verify(token, process.env.JWT_SECRET!);
          req.user = decoded as UserPayload;
          //   console.log(req.user);
          next();
        }else{
            res.status(401).json({message:"Unauthorized access,Please Login First"});
            return;

        }
    } catch (error) {
        res.status(401).json({message:"Unauthorized access, invalid token"});
        return;
    }

}
export default jwtVerify;