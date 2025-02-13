import { Response,Request, NextFunction } from "express"
const errorMiddleware = (err:any,req:Request,res:Response, next:NextFunction)=>{
    res.status(err.statusCode || 500).json({error:err.message || "Internal server error !"})
}

export default errorMiddleware;