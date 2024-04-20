// require('dotenv').config() // proper tarika niche h

import dotenv from "dotenv";
// import mongoose from "mongoose";             // ye dono db folder me transfer kr diya
// import { DB_NAME } from "./constants";       // database connection db folder me hi hoga
import express from "express";
import connectDB from "./db/index.js"
const app = express();
dotenv.config({
    path :'./.env'
}) // ye require walw me nahi krna

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`app is running at port :${process.env.PORT}` );
    })
})
.catch((error)=>{
    console.log("ERROR MONGODB connection failed ", error);
})




// ek bbat ratlo database dusre continent me h to time lgta
// error bhi bahut aati h
// to hamesha try catch or async await ka use krna

// IIFE 
// ( async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error", (error)=>{
//             console.log("ERRORR",error);
//             throw error;
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listening on ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.log("ERROR",error);
//     }
// })()