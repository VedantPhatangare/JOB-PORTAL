import express, { Router } from "express";
import { createJob, getJobs } from "../controllers/jobControllers.js";
import jwtVerify from "../middlewares/authMiddleware.js";
import multer from "multer";

const jobRouter:Router = express.Router();
const upload = multer();

jobRouter.post("/createjob",jwtVerify,upload.none(), createJob)
jobRouter.get("/getjobs", getJobs)

export default jobRouter;
