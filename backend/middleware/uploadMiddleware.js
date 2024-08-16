import multer from 'multer';
import path from 'path';
/*What Multer Does
File Upload Handling: Multer processes multipart/form-data requests, which is the format used when uploading files through forms. It parses the incoming request and extracts the file data.
File Storage Configuration: It allows you to configure where and how the files should be stored, either in memory or on disk.
File Filtering: You can set up filters to specify which types of files are accepted, adding a layer of validation. also size limits etc. only thing multer does is saves uploaded file*/
const storage = multer.diskStorage({
    // store file in this folder
    destination: "./uploads/images",
    /* here file is image from upload.single("image") in router that is sent from frontend. multer is used coz it takes file from frontend */
    filename: (req, file, cb) => {
        // giving name to uploaded file. using Date.now we have unique name every time
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

// storage refers to above defined storage
const upload = multer({
    storage: storage,
    // 1 MB file size limit
    limits: { fileSize: 1 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        // only images and of below format allowed
      const fileTypes = /jpeg|jpg|png/;
      const mimetype = fileTypes.test(file.mimetype);
  
      if (mimetype) {
        cb(null, true);
      } else {
        cb(new Error('Only images are allowed'));
      }
    }
  });

export default upload;