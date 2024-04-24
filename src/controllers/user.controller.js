 import { asyncHandler } from "../utils/asyncHandler.js";
 import { ApiError } from "../utils/ApiError.js";
 import { User } from "../model/user.model.js";
 import { uploadOnCloudinary } from "../utils/cloudinary.js"
 import { ApiResponse } from "../utils/ApiResponse.js";
 import jwt from "jsonwebtoken";

 const generateAccessTokenAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        // console.log("AccessToken",accessToken);
        const refreshToken = user.generateRefreshToken();
        // console.log("refreshToken",refreshToken);

        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave : false})

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
 }

 const registerUser = asyncHandler( async (req, res)=>{
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


    
    const userExist = await User.findOne({
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
    const userdata = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(userdata._id).select(
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

 const loginUser = asyncHandler( async(req, res)=>{
    // req.body ->data
    // username, email, password
    // find user -> not found send user not found
    // check passsword
    // access and refresh token
    // send cookie
    const { email, username, password } = req.body
    // console.log(username, email, password);
    if(!email && !username)
    {
        throw new ApiError(400,"username or password required")
    }
    const user = await User.findOne({
        $or : [{username},{email}]
    })
    if(!user)
    {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid)
    {
        throw new ApiError(401,"Invalid User Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,accessToken,refreshToken
            },
            "User Logged In Successfully"
        )
    )
    

 })

 const logoutUser = asyncHandler(async(req,res) =>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new : true,
        }
    )

    const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(201)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(
            200,
            {},
            "User Logged Out Successfully"
        )
    )
 })

 const refreshAccessToken = asyncHandler(async(req,res) =>{
    try {
        const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
        if(!incommingRefreshToken)
        {
            throw new ApiError(401, "Refresh Token not found")
        }
    
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET) ;
    
        const user = await User.findById(decodedToken._id);
    
        if(!user)
        {
            throw new ApiError(401, "Invalid Refresh Token")
        }
        
        if(incommingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401, "Refresh Token is Expired or used") 
        }
    
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        const option = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(201)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",newRefreshToken,option)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken : newRefreshToken
                },
                "Access Token Refreshed")
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Error invalid refresh token")
    }

 });

 const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword } = req.body

    // agr vo password change kr raha h to mtlb vo logged h 
    // to req me user bhi hoga
    const user = User.findById(req.user?._id)

    const isCorrectPassword = await user.isPasswordCorrect(oldPassword)

    if(!isCorrectPassword)
    {
        throw new ApiError(401, "Invalid Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password Changed Successfully"
        )
    )
 })

 const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "current user fetched successfully"
        )
    )
 })

 const updateUserDetails = asyncHandler(async(req, res)=>{
    const {fullname, email} = req.body

    if(!fullname || !email)
    {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {
            new : true,
        }
    ).select("-password ")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "User details updated successfully"
        )
    )
 })

 const updatedUserAvatars = asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, avatar)

    if(!avatar.url)
    {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "avatar updated successfully"
        )
    )
 })

 const updatedUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath)
    {
        throw new ApiError(400, "CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath, coverImage)

    if(!coverImage.url)
    {
        throw new ApiError(400, "Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                coverImage : coverImage.url
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "coverImage updated successfully"
        )
    )
 })

 export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updatedUserAvatars,
    updatedUserCoverImage
}; 