import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbConnection=  async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`, {
            serverSelectionTimeoutMS: 60000, // 60 seconds
            connectTimeoutMS: 60000, // 60 seconds
        })
        console.log(`MongoDB connected to Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDb connection failed: ", error);
        // Throw error instead of process.exit to let nodemon manage the process lifecycle
        throw error;
    }
}
export default dbConnection;