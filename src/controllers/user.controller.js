 import {asyncHandler} from "../utils/asyncHandler.js";
 import { ApiError } from "../utils/ApiError.js";
 import { user } from "../model/user.model.js";
 import { uploadOnCloudinary } from "../utils/cloudinary.js"
 import { ApiResponse } from "../utils/ApiResponse.js";


 const registerUser = asyncHandler( async (req,res)=>{
    // res.status(200).json({
    //     message : "ok : user is registered"
    // })

    // Register User Steps ->

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullname, email, username, password} = req.body
    // console.log("fullname ", fullname);
    // console.log("email ", email);
    // console.log("username ", username);
    // console.log("password ", password);
    if(fullname.trim() ===""){
        throw new ApiError(400, "Enter valid name")
    }
    if(email.trim() ==="" || !email.trim().includes("@")){
        throw new ApiError(400, "Enter valid email")
    }
    if(username.trim() ===""){
        throw new ApiError(400, "Enter valid username")
    }
    if(password.trim() ===""){
        throw new ApiError(400, "Enter valid password")
    }


    
    const userExist = user.findOne({
        $or : [{username},{email}]
    })
    if(userExist)
    {
        throw new ApiError(409, "User already exist")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }
    // if(!coverImageLocalPath)
    // {
    //     throw new ApiError(400, "CoverImage is required")
    // }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar)
    {
        throw new ApiError(400, "Avatar path error")
    }

    const user = await user.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await user.findById(user._id).select(
        "-password -refreshTokens"
    )

    if(!createdUser)
    {
        throw new ApiError(500, "Somthing went wrong while uploading data to database")
    }
    
    res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

 })

 export { registerUser }; 