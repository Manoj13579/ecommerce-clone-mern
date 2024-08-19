import React, { useEffect, useState } from 'react';
import './Admin.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import ConfirmationModal from '../Utility/Modal/ConfirmationModal';
import Loader from '../Utility/Loader/Loader';

const TotalOrder = () => {

 
  const[allUserOrders, setAllUserOrders] = useState();
  const[loading, setLoading] = useState(false);
  const[cartOrderId, setCartOrderId] = useState(null);
  const[userOrderId, setUserOrderId] = useState(null);
  const[cancelOrderStatusId, setCancelOrderStatusId] = useState(null);
  const[openDeleteModal, setOpenDeleteModal] = useState(false);
  const[openStatusModal, setOpenStatusModal] = useState(false);





// for S.No
let totalCount = 0;
  const getAllUserOrders = async() => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getalluserorders`, { withCredentials: true })
      if(response.data.success) {
        setAllUserOrders(response.data.data)
        
      }
    } 
    catch (error) {
      if(error.response && error.response.status === 500) {
        toast.error(error.response.data.message)
      }
      else{
    toast.error("fetching all user orders failed");
    console.log(error.message)  
    }};
    setLoading(false);
  }
  useEffect(() =>{
    getAllUserOrders();
  }, []);

const handleupdateUserOrderStatus = async (id) => {
  setOpenStatusModal(true);
  setCancelOrderStatusId(id);
};


const handleConfirmOrderStatus = async () => {
  try {

    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/updateuserorderstatus`, { cancelOrderStatusId },
      { withCredentials: true })
    if(response.data.success) {
      toast.success("status changed to delivered");
      getAllUserOrders();
    }
  } 
  catch (error) {
    if(error.response && (error.response.status === 404 || error.response.status === 400 || error.response.status === 500)) {
      toast.error(error.response.data.message)
    }
    else{
  toast.error("status update failed");
  console.log(error.message)  
  }
};
  setLoading(false);
  setOpenStatusModal(false);
  setCancelOrderStatusId(null);
};


const handleCancelOrderStatus = () => {
  setUserOrderId(null);
  setOpenStatusModal(false);
}





const handleDelete = (ccartOrderId, uuserOrderId) => {
  setOpenDeleteModal(true);
  setCartOrderId(ccartOrderId);
  setUserOrderId(uuserOrderId);
  };
  
  
    const handleConfirmDelete = async() => {
      try {
        setLoading(true);
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/deleteuserorder`, { cartOrderId, userOrderId }, { withCredentials: true});
        // just to get latest data after delete
        getAllUserOrders();
        if(response.data.success){
          toast.success('successfully deleted');
        }
      } 
      catch (error) {
        if(error.response && (error.response.status === 404 || error.response.status === 500)) {
          toast.error(error.response.data.message)
        }
        else
      toast.error("Deleting failed");
      console.log(error.message)  
      }
      setLoading(false);
      setOpenDeleteModal(false);
      setCartOrderId(null);
    setUserOrderId(null);
  };
  
  const handleCancelDelete = () => {
    setCartOrderId(null);
    setUserOrderId(null);
    setOpenDeleteModal(false);
  };
  
  
  return (
    <>
    {loading && <Loader />}
    <section className="totalorder-container">
    <h5>All Order</h5>
    <table>
      <thead>
        <tr>
          <th>S.No.</th>
          <th>Order ID</th>
          <th>Product</th>
          <th>Title</th>
          <th>Category</th>
          <th>Price</th>
          <th>Ordered Qty</th>
          <th>Remaining Qty</th>
          <th>Ordered On</th>
          <th>User</th>
          <th>Email</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Address</th>
          <th>Mobile</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {allUserOrders?.slice()
              // date is in string format so changed to Date object to compare.
              //substracting date automatically changes to milliseconds and substracts it.
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((product) => ( 
          product.cartOrder.map((item, itemIndex) => {
            totalCount++;
            /* we are using  totalCount++; and dont want to return this 
            so are using this format oterwise just () had worked no need to
            => { and return(*/
            return(
            <tr key={`${product._id}-${itemIndex}`}>
              <td>{totalCount}</td>
              <td>{product._id}</td>
              <td><img src={item.image} alt="" style={{ width: '50%' }} /></td>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>${item.price}</td>
              <td>{item.orderedQuantity}</td>
              <td>{item.quantity - item.orderedQuantity}</td>
              <td>{product.createdAt.substring(0, 10)}</td>
              <td>{product.name}</td>
              <td>{product.email}</td>
              <td>{product.payment}</td>
              <td> <div className="totalorder-dropdown">
    <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    {product.status}
    </button>
    <ul className="dropdown-menu">
      <li onClick={() => handleupdateUserOrderStatus(product._id)} className='dropdown-item'>Delivered</li>
    </ul>
  </div></td>
              <td>{product.address}</td>
              <td>{product.mobile}</td>
              <td><button onClick={() => handleDelete(item._id, product._id)}className='totalorder-button-delete'>Delete Order</button></td>
            </tr>
          )})
        ))}
      </tbody>
    </table>
  </section>
  <ConfirmationModal
  isOpen={openDeleteModal}
  message={"Are you sure you want to delete order?"}
  onConfirm={handleConfirmDelete}
  onCancel={handleCancelDelete}
  />
      <ConfirmationModal
    isOpen={openStatusModal}
    message={"Are you sure you want to change status to delivered"}
    onConfirm={handleConfirmOrderStatus}
    onCancel={handleCancelOrderStatus}

    />
  </>
  );
};

export default TotalOrder;