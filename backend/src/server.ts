import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import dbConnection from "./config/db.js";

const app = express();
dotenv.config();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// routes
app.get("/api/home", (req: Request, res: Response) => {
  res.send("Home");
});
app.use("/api/auth", authRouter);


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
