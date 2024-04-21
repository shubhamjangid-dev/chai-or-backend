import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile : {
        type : String, // cloudinary service
        required : true,
    },
    thumbnail : {
        type : String, // cloudinary service
        required : true,
    },
    title : {
        type : String, // cloudinary service
        required : true,
    },
    discription : {
        type : String, // cloudinary service
        required : true,
    },
    duration :{
        type : Number,
        required : true
    },
    views:{
        type : Number,
        default : 0
    },
    isPublished :{
        type : Boolean,
        default : true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref :"User"
    }
},
{
    timestamps : true
}
)

videoSchema.plugin(mongooseAggregatePaginate);

export const videos = mongoose.model("videos", videoSchema);