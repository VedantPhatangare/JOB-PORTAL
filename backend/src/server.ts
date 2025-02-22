import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import dbConnection from "./config/db.js";
import jobRouter from "./routes/jobRoutes.js";
import applicationRouter from "./routes/applyRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
const app = express();
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirnam = path.dirname(__filename);
const resumePath = path.join(__dirnam,"../uploads");
// console.log(resumePath);

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use('/getresume/', express.static(resumePath))

// routes
app.get("/api/test",(req,res)=>{
  res.json({message:"test success"})
})
app.use("/api/auth", authRouter);
app.use('/api/jobs',jobRouter);
app.use('/api/application',applicationRouter);


// server
const PORT = process.env.PORT || 5000;

dbConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {console.log(err);
  });


// error middleware
app.use(errorMiddleware);
