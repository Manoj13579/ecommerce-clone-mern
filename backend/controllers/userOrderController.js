import UserOrder from "../models/userOrder.js";
import Users from "../models/users.js";

const addUserOrder = async (req, res) => {
  
  try {
    const { userorder } = req.body;

    if (!userorder) {
      return res.status(400).json({ success: false, message: 'User order data is required.' });
    }

    const userid = userorder.userid;

    const user = await Users.findById(userid);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // save userorder in UserOrder collection in database
    /* The new operator is a JavaScript keyword used to create a new instance of a class or constructor function. When working with Mongoose, new is used to create a new instance of a Mongoose model, which represents a document but is not yet saved to the database.
Key Points:
Instance Creation: You use new to create a new instance of a model.
Saving: After creating an instance with new, you need to explicitly call .save() to persist the document to the database.
Return Value: The new operator returns an instance of the model. */
   const savedOrder = await new UserOrder(userorder).save();

    return res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    console.error('Error in placing order:', error);
    return res.status(500).json({ success: false, message: 'Error in placing order', error });
  }
};


const getUserOrder = async(req, res) => {
  
  const userid = req.query.userId;
  if(!userid){
    return res.status(400).json({ success: false, message: 'Unauthorized User'})
  }
  try {
    /* .find returns all items of given parameter here userid whereas findOne returns only one item of given parameter */
    const data = await UserOrder.find({userid: userid});
    return res.status(200).json({ success: true, message: "successfully fetched user order", data})
  }
   catch (error) {
    return res.status(500).json({ success: false, message: 'error fetching user order'})
  }
};
const getAllUserOrders = async(req, res) => {
  
  try {
    const data = await UserOrder.find();
    return res.status(200).json({ success: true, message: "successfully fetched user order", data})
  }
   catch (error) {
    return res.status(500).json({ success: false, message: 'error fetching user order'})
  }
};



const deleteUserOrder = async (req, res) => {
  const { userOrderId, cartOrderId } = req.body;
  
  try {
    // Find the UserOrder by ID
    const userOrder = await UserOrder.findById(userOrderId);

    if (!userOrder) {
      return res.status(404).json({ message: 'UserOrder not found' });
    }

    
    /* This line looks through the cartOrder array in the userOrder object to find the index of the item with the ID matching cartOrderId. findIndex returns the position of the item if found, or -1 if not. here item._id is object id created by database for cartOrder automatically and it's type is objectId and we are passing cartOrderId from frontend which previously was created by database as objectId but we get it in frontend and send it from there while sending it's data type is string. so need to change item._id to string*/
    const cartOrderIndex = userOrder.cartOrder.findIndex(item => item._id.toString() === cartOrderId);

    if (cartOrderIndex === -1) {
      return res.status(404).json({ message: 'CartOrder item not found' });
    }

    /* if found Remove the item from the array but just one even if two items with same id. findIndex returns index of first item that matches call back. here if id is equal then return first matched item's index */
    userOrder.cartOrder.splice(cartOrderIndex, 1);

    /* if the cartOrder array is now empty (meaning there are no items left in the order), the function deletes the entire userOrder from the database. cartOrder can have more than one product in single order or package if one product only deleted from a package containing two products then UserOrder is not deleted if only one product UserOrder is deleted. imp to do this coz there could be lots of UserOrder saved in database without  cartOrder.*/
    if (userOrder.cartOrder.length === 0) {
      await UserOrder.deleteOne({ _id: userOrderId });
      return res.status(200).json({ message: 'CartOrder item deleted and UserOrder removed successfully', success: true });
    }

    // Save the updated UserOrder document
    await userOrder.save();

    res.status(200).json({ message: 'CartOrder item deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserOrderStatus = async(req, res) => {
  
  
  const userid = req.body.cancelOrderStatusId;
  if(!userid) {
   return res.status(400).json({ success: false, message: 'user not found'})
  };
  try {
    const data = await UserOrder.findByIdAndUpdate(userid, {
    status: 'delivered',
    },
    { new: true }
  );
  if (!data) {
   return res.status(404).json({success: false, message: "Product not found" });}

  else {
   return res.status(200).json({success: true, message: "updated successfully", data });
  }
  } 
  catch (error) {
   return  res.status(500).json({ success: false, message: error.message})
  }

}

export { addUserOrder, getUserOrder, deleteUserOrder, getAllUserOrders, updateUserOrderStatus};