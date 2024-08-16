import { uploadOnCloudinary } from '../Config/Cloudinary.js';
import fs from 'fs';

const uploadImageOnCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    console.log('uploadImageOnCloudinary file path', req.file.path);
    // req.file.path is a path(folder where multer saves file) with image name created by multer uploads\images\mage_1723020066290.webp
    const localFilePath = req.file.path;
    // inside this data we have url of file created by cloudinary
    const data = await uploadOnCloudinary(localFilePath);

    // Delete the local file after successful upload to Cloudinary
    fs.unlinkSync(localFilePath);

    return res.status(200).json({ success: true, message: 'File uploaded to Cloudinary successfully', data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not upload file', error: error.message });
  }
};

export { uploadImageOnCloudinary };