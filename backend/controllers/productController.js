// in import module in backend use  .js otherwise errror
import Product from "../models/product.js";
import cloudinary from 'cloudinary'; // Make sure to import Cloudinary


// getting all products and sending to frontend
const allproducts = async (req, res) => {
  try {
   const  data = await Product.find();
    /*200 OK: Meaning: The request has succeeded.
  Use Case: This code is used for successful GET, POST, PUT, DELETE, etc., requests. For example, when fetching products or successfully updating a product, you return a 200 status code. */
  res.status(200).json(data);
}
    /*500 Internal Server Error:Meaning: The server has encountered a situation it doesn't know how to handle.
  Use Case: This code is used for general server errors. For example, when an unexpected condition occurs preventing the server from fulfilling the request, such as database connection issues or unhandled exceptions in the code. */
      catch (err) {
    res.status(500).json({ success: false, message: "Error fetching products", error: err });
  }
};

// Adding Products
const addproduct = async (req, res) => {
  try{

   const data = await Product.create(req.body);
    /*201 Created: Meaning: The request has been fulfilled and has resulted in one or more new resources being created.
  Use Case: This code is typically used for POST requests when a new resource is created, such as when a new product is added to the database. */
     return res.status(201).json(data);
  }
    /*400 Bad Request: Meaning: The server could not understand the request due to invalid syntax.
Use Case: This code is used when the request sent by the client is incorrect or malformed, such as when required fields are missing or invalid data is provided in the request body. */
    catch (err) 
    { return res.status(400).json({success: false, message: "Error Adding Data", error:err})};
};

// Deleting Products
// Deleting Products from req.body
// if using params await Product.findOneAndDelete({ _id: req.params._id });
const deleteproduct = async (req, res) => {
  const _id = req.body.itemIdToDelete;
  const public_id = req.body.publicIdToDelete;
  
  
  try{
    // First, delete the image from Cloudinary
    if (public_id) {
      await cloudinary.v2.uploader.destroy(public_id);
    }
    const data = await Product.findByIdAndDelete(_id);
    if (!data) {
      /*404 Not Found: Meaning: The server can not find the requested resource.
Use Case: This code is used when the requested resource could not be found on the server. For example, when trying to update or delete a product that does not exist in the database. */
    return  res.status(404).json({sucess: false, message: "Product not found" });
    } else {
     return res.status(200).json(data);
    }
  }
    catch (err) {
      return res.status(500).json({sucess: false, message: "Error deleting product", error: err })};
};

const deleteOldImage = async (req, res)=> {
  const public_id = req.body.publicId;
  console.log('deleteOldImage hit', public_id);
  
  try{
    if (public_id) {
      await cloudinary.v2.uploader.destroy(public_id);
    }
    res.status(200).json({success: true });
  }
    catch (err) {
      return res.status(500).json({sucess: false, message: "Error deleting product", error: err })};
}

// updating products
const updateproducts = async (req, res) => {
 const _id = req.body._id;
 try {
  
   const data = await Product.findByIdAndUpdate(
           _id,
           {
             /* title refers title of schema or database and req.body.title value
           we will provide it from frontend so new product will be created 
           similar logic to all properties*/
             title: req.body.title,
             image: req.body.image,
             category: req.body.category,
             new_price: req.body.new_price,
             old_price: req.body.old_price,
             quantity: req.body.quantity,
             description: req.body.description,
             public_id: req.body.public_id,
           },
           { new: true } // This option returns the updated document
         )
     
           if (!data) {
             /*404 Not Found: Meaning: The server can not find the requested resource.
     Use Case: This code is used when the requested resource could not be found on the server. For example, when trying to update or delete a product that does not exist in the database. */
            return res.status(404).json({success: false, message: "Product not found" });}

           else {
            return res.status(200).json(data);
           }
         }
 
      catch(err)
       { return res.status(500).json({sucess: false, message: "Error updating product", error: err })};
  
};

export { addproduct, deleteproduct, allproducts, updateproducts, deleteOldImage };