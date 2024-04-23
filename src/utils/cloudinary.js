import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        const responce = cloudinary.uploader.upload(localFilePath,{ 
            resource_type: "auto" 
        })
        // file has been uploaded successfully
        // console.log((await responce).url);

        fs.unlink(localFilePath)// delete file from public/temp

        return responce;
    } catch (error) {
        fs.unlink(localFilePath) // remove the locally saved temporary file as the upoad operation got failed
        return null;
    }
}

export {uploadOnCloudinary};