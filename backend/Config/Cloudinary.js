// we are importing v2(version 2) and renaming as cloudinary. can just name as v2 but good to rename it
import { v2 as cloudinary} from "cloudinary";
/* fs is filesystem built in in node js. used to read, write, delete etc file. here used to delete file . delete is called unlink */
import fs from "fs";


// / this config bcoz of secret key and other two authorizes to save file in particular user account in cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload file on Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  /* if no public_id from us cloudinary will create unique id and place it in image url so image will have unique url also coz of multer using Date.Now()(it is used in image naming and naming is also included by cloudinary to create image url) */
  try {
    const data = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      // save in this folder in cloudinary
      folder: "ecommerce-clone",
    });
    console.log("File uploaded on Cloudinary successfully", data.url);
    return data;
  } catch (error) {
    /* if there is error in file is not uploaded to cloudinary we need to delete it coz there will be lots of unuploaded file saved in server and is not good. makes server size or backend code file big. if successfully uploaded then it is not saved here and it's not a problem */
      fs.unlinkSync(localFilePath);

  }
};
// this uploadOnCloudinary  is used by cloudinaryUploadController
export { uploadOnCloudinary };