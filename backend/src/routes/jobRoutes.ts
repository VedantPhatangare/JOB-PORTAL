import express, { Router } from "express";
import { createJob, DeleteJob, getJobs, getCategories, getRecommendedJobs, toggleBookmarkJob, getSavedJobs, updateJob } from "../controllers/jobControllers.js";
import jwtVerify from "../middlewares/authMiddleware.js";
import multer from "multer";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createJobSchema } from "../validations/job.validation.js";

const jobRouter: Router = express.Router();
const upload = multer();

jobRouter.post("/createjob", jwtVerify, upload.none(), validateRequest(createJobSchema), createJob);
jobRouter.get("/getjobs", getJobs);
jobRouter.get("/categories", getCategories);
jobRouter.get("/recommended", jwtVerify, getRecommendedJobs);
jobRouter.delete("/deletejob", jwtVerify, DeleteJob);
jobRouter.put("/update/:id", jwtVerify, upload.single("companyLogo"), updateJob);
jobRouter.post("/bookmark/:id", jwtVerify, toggleBookmarkJob);
jobRouter.get("/saved", jwtVerify, getSavedJobs);
export default jobRouter;
