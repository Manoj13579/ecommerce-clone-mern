import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../Utility/Loader/Loader.jsx'
import { LuPackage } from "react-icons/lu";
import ConfirmationModal from '../../Utility/Modal/ConfirmationModal.jsx';
import ReviewModal from '../../Utility/Modal/ReviewModal.jsx';
import './Order.css';



const UserOrder = () => {
  const [userOrder, setUserOrder] = useState([]);
  const[loading, setLoading] = useState(false);
  const[cartOrderId, setCartOrderId] = useState(null);
  const[userOrderId, setUserOrderId] = useState(null);
  const[openModal, setOpenModal] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
  
  /* good to use fetch async data like this instead of inside useEffect. this way clear code separation and i can use it inside another function if necessary. i have used it inside handleDelete to update page after delete*/
    const fetchUserOrder = async () => {
      setLoading(true);
      try {
        /* in get request can't send data from body so sent as params */
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/getuserorder`,
          {
            withCredentials: true,
            params: {
                userId: userinfo._id
        }}
        );
        if(response.data.success){
          setUserOrder(response.data.data)
        }
      } 
      catch (error) {
        if(error.response && (error.response.status === 400 || error.response.status === 500)) {
          toast.error(error.response.data.message)
        }
        else
      toast.error("Deleting failed");
      console.log(error.message)  
      }
      setLoading(false)
    };

    useEffect(() => { 
      fetchUserOrder();
  }, []);

const handleDelete = (ccartOrderId, uuserOrderId) => {
setOpenModal(true);
setCartOrderId(ccartOrderId);
setUserOrderId(uuserOrderId);
}


  const handleConfirmDelete = async() => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/deleteuserorder`, { cartOrderId, userOrderId }, { withCredentials: true});
      console.log(response.data);
      
      if(response.data.success){
        toast.success('successfully deleted');
      }
      // just to get latest data after delete
      fetchUserOrder();
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
    setOpenModal(false);
    setCartOrderId(null);
  setUserOrderId(null);
  };


const handleCancelDelete = () => {
  setCartOrderId(null);
  setUserOrderId(null);
  setOpenModal(false);
};

const handleReview = (productId) => {
  setReviewModalOpen(true);
  setReviewProductId(productId);
};
/* here data refers to { review, rating } in form submit */
const handleReviewSubmit =async (data) => {
let allData = {
  ...data, 
  productId:reviewProductId, 
  userName:userinfo.name,
}
try {
  setLoading(true);
 const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/review`, {allData}, { withCredentials: true});

 
 if (response.data.success) {
toast.success("review placed");
 }
} catch (error) {
  if(error.response && error.response.status === 500) {
    toast.error(error.response.data.message)
  }
  else
toast.error("Deleting failed");
console.log(error.message)
}
setLoading(false);
setReviewModalOpen(false);
setReviewProductId(null);
};

const handleReviewCancel = () => {
  setReviewModalOpen(false);
  setReviewProductId(null);
};


  return (
    <>
    {loading && <Loader />}
    {userOrder?.length > 0 ? (
      <section>
        {userOrder?.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((product) => (
          <div key={product._id} className='myorder-container'>
            {/* here no need to use && but below By adding product.cartProducts ?, you're ensuring that cartProducts is not undefined or null before trying to map over it. takes time to get value in child array and throws error if used below */}
  {/* product.cartProducts takes time to load so need ?.
      userOrders.map will be handled by status but not child array*/}
            {product?.cartOrder?.map((item) => (
              <div key={item._id}>
                <h5 className="myordercart-product-h">My Order:</h5>
                <p><LuPackage /> Package 1</p>
                <p>order: {product._id}</p>
                <p className='myorder-placedon'>placed on {product.createdAt?.substring(0, 10)}</p>
                {product.status === "processing" ? (
                  <div>
                    <span>{product.status}</span>
                    <progress value="50" max="100"></progress>
                  </div>
                ) : (
                  <div>
                    <progress value="100" max="100"></progress>
                    <span>{product.status}</span>
                  </div>
                )}

                <div className="myordercart-container">
                  <img
                    className="myordercart-item-img"
                    src={item.image}
                    alt="image"
                  />
                  <h6>price: <span className="myordercart-price">${item.price}</span></h6>
                  <h6>payment: <span className="myordercart-price">{product.payment}</span></h6>
                  <h6>quantity: <span className="myordercart-price">{item.orderedQuantity}</span></h6>
                </div>
                {product.status === "processing" ? (
                  /* here item._id is id inside cartOrder whereas product._id is not product id of products added by admin rather it is just a id (self created by db) created by Order.jsx by addorder route. this id contains cartOrder array. see Order.jsx for structure. */
                  <p onClick={() => handleDelete(item._id, product._id)} className='myorder-cancel'>cancel order</p>
                ) : (
                  /* here using item._id coz want to write comment for paricular item. but in AddCart when accessing this review we do it by product._id coz we want all comments of that particular product.in model that's why productId field*/
                  <p onClick={() => handleReview(item.productid)} className='myorder-review'>WRITE A REVIEW</p>
                )}
                <p>Shipping Address -</p>
                <div className='myorder-shipping'>
                  <p>name: {product.name}</p>
                  <p>email: {product.email}</p>
                  <p>mobile: {product.mobile}</p>
                  <p>district: {product.district}</p>
                  <p>full address: {product.address}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    ) : <h4>No Items Ordered</h4>}
    <ConfirmationModal
    // cycle1: user clicks delete buttton openModal set to true.
    // cycle2: if user clicks onConfirm id is passed to handleConfirmDelete from handleDelete
    // cycle2: if user clicks onCancel id is set to null and openModal to false from handleCancelDelete
        isOpen={openModal}
        message={"Are you sure you want to cancel order?"}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={handleReviewCancel}
        /*passed as prop.This function takes { review, rating } as object when the form is submitted.*/
        handleReviewOnSubmit={handleReviewSubmit}
      />
  </>
);
};

export default UserOrder;