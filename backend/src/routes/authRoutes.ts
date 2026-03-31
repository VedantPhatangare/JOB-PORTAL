import express, { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAuthToken, getMe, updateProfile, getPublicProfile } from "../controllers/authControllers.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import jwtVerify from "../middlewares/authMiddleware.js";
import Fileupload from "../middlewares/multerMiddleware.js";

const authRouter: Router = express.Router();

authRouter.post("/register", validateRequest(registerSchema), registerUser);
authRouter.post("/login", validateRequest(loginSchema), loginUser);
authRouter.post("/logout", jwtVerify, logoutUser);
authRouter.post("/refresh", refreshAuthToken);
authRouter.get("/me", jwtVerify, getMe);

// Profile management
authRouter.patch("/profile", jwtVerify, Fileupload.fields([{ name: "profileImage", maxCount: 1 }, { name: "resume", maxCount: 1 }]), updateProfile);
authRouter.get("/profile/:userId", getPublicProfile);

export default authRouter;
