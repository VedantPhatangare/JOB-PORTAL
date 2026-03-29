import express, { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAuthToken, getMe } from "../controllers/authControllers.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import jwtVerify from "../middlewares/authMiddleware.js";

const authRouter: Router = express.Router();

authRouter.post("/register", validateRequest(registerSchema), registerUser);
authRouter.post("/login", validateRequest(loginSchema), loginUser);
authRouter.post("/logout", jwtVerify, logoutUser);
authRouter.post("/refresh", refreshAuthToken);
authRouter.get("/me", jwtVerify, getMe);

export default authRouter;
