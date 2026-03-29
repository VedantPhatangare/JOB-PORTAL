import mongoose from "mongoose";
import Application from "./src/models/application.model.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobportal");
        console.log("Connected to DB");
        const apps = await Application.find().sort({ createdAt: -1 }).limit(3);
        apps.forEach((app, i) => {
            console.log(`Application [${i}]:`);
            console.log(`- Resume Path: ${app.resume}`);
            console.log(`- Job ID: ${app.job_id}`);
            console.log(`- Status: ${app.status}`);
            console.log(`-----------`);
        });
    } catch (error) {
        console.error("DB Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
