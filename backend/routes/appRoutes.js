import express from 'express';
import { addproduct, deleteproduct, allproducts, updateproducts, deleteOldImage } from '../controllers/productController.js';
import { userssignup, userslogin, refreshToken, logout, requestPasswordReset, resetPassword, jwtEmailConfirmation, getAllUsers, adminProfileEdit, userProfileEdit } from '../controllers/authController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {  googleAuth, googleAuthCallback, googleLogout, userInfo } from '../Config/passport.js';
import { deleteUserOrder, getAllUserOrders, getUserOrder, updateUserOrderStatus, addUserOrder } from '../controllers/userOrderController.js';
import eitherAuthMiddleware from '../middleware/eitherAuthMiddleware.js';
import { getReviewByProductId, review } from '../controllers/reviewController.js';
import { uploadImageOnCloudinary } from '../controllers/cloudinaryUploadController.js';
import { capturePaypalOrder, createPaypalOrder } from '../Config/paypalConfig.js'
import { esewaGetSecret, verifyEsewaResponse } from '../Config/esewaConfig.js';




const router = express.Router();
/*  When you include app.use('/', appRoutes) in your main application file, it means:
    A GET request to '/' (e.g., http://localhost:4000/) will be handled by the home function in appController.js.
    A POST request to '/addproduct' (e.g., http://localhost:4000/addproduct) will be handled by the product function in appController.js.
    Main Application Flow
    Incoming Request: When an incoming request is received by the server (e.g., GET http://localhost:4000/).
    Path Matching: The server checks the path of the incoming request against the base path provided in app.use. Since the base path is '/', it matches any request.
    Delegating to Router: The router object (appRoutes) takes over and checks its own route definitions to find a matching handler.
    Handling the Request: If a matching route is found, the corresponding handler function (e.g., home for GET '/') is executed. If no matching route is found within the router, the request is passed to the next middleware or results in a 404 error if no other routes are defined.*/
//This line sets up a GET request handler for the root URL (/). When a GET request is made to the root URL, the home function from the appController.js is called.
// Route for getting all Products.good to any app to set root for fetching all product.
router.get("/api/", allproducts);


// Route for adding products
//This line sets up a POST request handler for the URL addproduct. When a POST request is made to this URL, the product function from the appController.js is called.
// only by admin
router.post('/api/addproduct', authenticateToken, authorizeAdmin, addproduct);


// Route for Deleting Products from req.body
// if using params router.delete('/deleteproduct/:id', deleteproduct);
// only by admin
router.delete('/api/deleteproduct', authenticateToken, authorizeAdmin, deleteproduct);

// updating products
// only by admin
router.put("/api/updateproducts", authenticateToken, authorizeAdmin, updateproducts);
router.delete('/api/delete-old-image', authenticateToken, authorizeAdmin, deleteOldImage);

// Upload route
// only by admin
//`upload.single('image')` means we're expecting a single file with the field name 'image'
// upload.single("image") is a middleware provided by multer which we are importing above.
// here we are saving uploaded image in cloudinary so using uploadImageOnCloudinary from cloudinaryUploadController. in saving to local or in this server use  uploadImageOnServer controller. it is not deleted from this backend.
router.post("/api/adminuploads", authenticateToken, authorizeAdmin, upload.single("image"), uploadImageOnCloudinary);
router.post("/api/usersignupuploads", upload.single("image"), uploadImageOnCloudinary);
router.post("/api/userloginuploads", authenticateToken, upload.single("image"), uploadImageOnCloudinary);

// auth route
router.post('/api/signup', userssignup);
router.post('/api/login', userslogin);
router.post('/api/logout', logout);
// for generating refresh-token only it is saved in server
router.post('/api/refresh-token', refreshToken);
//protected route for users
router.get('/api/getallusers', authenticateToken, authorizeAdmin, getAllUsers)
router.post('/api/request-passwordreset', requestPasswordReset);
router.post('/api/reset-password', resetPassword);
router.post('/api/request-jwtemailconfirmation', jwtEmailConfirmation);
//protected route for admins if authenticateToken token go to next that is authorizeAdmin. defined in controller
router.post('/api/adminprofileedit', authenticateToken, authorizeAdmin, adminProfileEdit)
router.post('/api/userprofileedit', authenticateToken, userProfileEdit)

// google auth route
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);
router.get('/login/success', userInfo,);
router.post('/googlelogout', googleLogout,);

// Orders route
router.post('/api/adduserorder', eitherAuthMiddleware, addUserOrder,)
router.get('/api/getuserorder', eitherAuthMiddleware, getUserOrder,)
router.get('/api/getalluserorders', authenticateToken, authorizeAdmin, getAllUserOrders,)
router.post('/api/deleteuserorder', eitherAuthMiddleware, deleteUserOrder,)
router.post('/api/updateuserorderstatus', authenticateToken, authorizeAdmin, updateUserOrderStatus)

// review route
router.post('/api/review', eitherAuthMiddleware, review)
router.get('/api/getreviewbyproductid', getReviewByProductId)

// paypal route
/* The PayPal routes are defined in a separate file 
This means that any request starting with /paypal will be handled by the routes defined in your PayPalroutes.js file. For example:
A POST request to /paypal/create_order will be handled by the create_order route defined in your PayPal.routes file.
A POST request to /paypal/complete_order will be handled by the complete_order route defined in your PayPal routes file.paypalRoutes.js imported above*/
router.post('/api/orders', eitherAuthMiddleware, createPaypalOrder);
router.post('/api/orders/:orderID/capture',eitherAuthMiddleware, capturePaypalOrder);

// esewa route
router.post('/api/esewa-getsecret', eitherAuthMiddleware, esewaGetSecret);
router.post('/api/verify-esewa-response', eitherAuthMiddleware, verifyEsewaResponse);
export default router;