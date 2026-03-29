import express, { Router } from "express";
import { createJob, DeleteJob, getJobs, getCategories } from "../controllers/jobControllers.js";
import jwtVerify from "../middlewares/authMiddleware.js";
import multer from "multer";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createJobSchema } from "../validations/job.validation.js";

const jobRouter: Router = express.Router();
const upload = multer();

jobRouter.post("/createjob", jwtVerify, upload.none(), validateRequest(createJobSchema), createJob);
jobRouter.get("/getjobs", getJobs);
jobRouter.get("/categories", getCategories);
jobRouter.delete("/deletejob", jwtVerify, DeleteJob);

export default jobRouter;
