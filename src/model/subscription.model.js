import mongoose , { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type : Schema.Types.ObjectId, // janta
        ref : "User"
    },
    channel:{
        type : Schema.Types.ObjectId, // creaters
        ref : "User"
    }
},
{
    timestamps : true
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);