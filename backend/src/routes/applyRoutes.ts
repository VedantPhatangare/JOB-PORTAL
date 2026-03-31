import express, { Router } from "express";
import { apply, getApplicant, getApplicants, HireCandidate, getAppliedJobs, withdrawApplication } from "../controllers/applicationControllers.js";
import jwtVerify from "../middlewares/authMiddleware.js";
import Fileupload from "../middlewares/multerMiddleware.js";

const applicationRouter: Router = express.Router();

applicationRouter.post("/:job_id/apply", jwtVerify, Fileupload.fields([
  { name: "resume", maxCount: 1 }, { name: "coverletter", maxCount: 1 }
]), apply);

applicationRouter.get("/:job_id/getApplicants", getApplicants);
applicationRouter.post("/getApplicant", getApplicant);
applicationRouter.post("/:applicant_id/decision", jwtVerify, HireCandidate);
applicationRouter.get("/candidate/applied", jwtVerify, getAppliedJobs);
applicationRouter.delete("/:job_id/withdraw", jwtVerify, withdrawApplication);

export default applicationRouter;