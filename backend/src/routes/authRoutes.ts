import express, {Router} from 'express'
import { loginUser, registerUser } from '../controllers/authControllers.js';

const authRouter:Router = express.Router();

authRouter.post('/register',registerUser);
authRouter.post('/login',loginUser);

export default authRouter;
