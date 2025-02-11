import express, { Request,Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRouter from './routes/authRoutes.js';


const app = express();
dotenv.config();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// routes
app.use('/api/auth',authRouter)

app.get('/api/home',(req:Request,res:Response)=>{
    res.send("Home")
})

// server
const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{console.log(`Server running on port ${PORT}`);
})
