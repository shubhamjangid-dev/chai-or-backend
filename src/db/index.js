import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MONGODB Connected Successfully",`${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB Connection FAILED",error);
        process.exit(1) // app band kr ne ke liye
    }
}

export default connectDB; // ye jaruri h