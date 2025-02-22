import express, { Router } from "express";
import { createJob, getJobs } from "../controllers/jobControllers.js";
import jwtVerify from "../middlewares/authMiddleware.js";

const jobRouter:Router = express.Router();

jobRouter.post("/create",jwtVerify, createJob)
jobRouter.get("/getjobs", getJobs)

export default jobRouter;
