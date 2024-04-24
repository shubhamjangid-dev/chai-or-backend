 import { asyncHandler } from "../utils/asyncHandler.js";
 import { ApiError } from "../utils/ApiError.js";
 import { User } from "../model/user.model.js";
 import { uploadOnCloudinary } from "../utils/cloudinary.js"
 import { ApiResponse } from "../utils/ApiResponse.js";

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

 export { registerUser, loginUser, logoutUser }; 