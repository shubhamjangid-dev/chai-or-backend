import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parse";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: "16kb"})); // limit lga rahe ki server pe isse jayda load na aaye
app.use(urlencoded({extended : true, limit :"16kb"})); // url ko uncode krta h // ex- %20 mtlb=> space
app.use(express.static("public"));
app.use(cookieParser());
export {app};