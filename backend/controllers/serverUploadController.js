const uploadImageOnServer = (req, res) => {
    // image url sent to frontend
    /* After Multer processes the file, it’s available in req.file. we can do whatever we want with this response. here sending image url to frontend.  when image uploaded and url created by multer we can access it in anywhere in backend no need to import it. just use req.file*/
    res.json({
        success: true,
        image_url: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
};


export default uploadImageOnServer;