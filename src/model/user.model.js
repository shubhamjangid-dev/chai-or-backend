import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"


const userSchema = new Schema({
    username : {
        type : String,
        require : true,
        uniqie : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        require : true,
        uniqie : true,
        lowercase : true,
        trim : true
    },
    fullname : {
        type : String,
        require : true,
        trim : true,
        index : true
    },
    avatar : {
        type : String, // cloudinary service
        require : true,
    },
    coverImage : {
        type : String // cloudinary service
    },
    watchHistor : [
        {
            type :Schema.Types.ObjectId,
            ref : "video",
        }
    ],
    password : {
        type : String,
        require : [true,"password is required"]
    },
    refreshTokens : {
        type : String,
    }

},
{
    timestamps : true
}
)

// pre -> kuch kaam ke hone se just pahle ye call hoga
userSchema.pre("save", async function(next){ // arrow function mt use krna kyuki uske pass this. ka reference nahi hota
    // pr har baar password thodi change krna h
    // naye user or pass word change pe hi krna h
    if(this.isModified("password"))
        this.password = bcrypt.hash(this.password, 10);
    next();
})

// login krte waqt password sahi h ya galat h vo bhi check krna h
// creating own method
userSchema.methods.isPasswordCorrect = async function(){
    return await bcrypt.compare(password, this.password) // 1st parameter is password and 2nd is incrypted password
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username,
        fullname : this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
export const user = mongoose.model("User", userSchema);