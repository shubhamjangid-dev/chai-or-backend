import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Not authorized to access this route");
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user)
        {
            // todo discuss about frontend
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,"Invalid access token");
    }
})
