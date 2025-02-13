import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbConnection=  async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`MongoDB connected to Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDb connection failed: ", error);
        process.exit(1);
    }
}
export default dbConnection;