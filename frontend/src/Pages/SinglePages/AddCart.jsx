import React, { useState, useEffect } from 'react';
import {  
  useNavigate,
  useParams,
  } from 'react-router-dom';
import './singlePages.css';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../Store/cartSlice';
import StarRating from '../../Utility/StarRating/StarRating';
import axios from 'axios';
import Loader from '../../Utility/Loader/Loader';
import { toast } from 'react-toastify';


const AddCart = () => {
  
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const allproducts = useSelector(state => state.products.data);
  const param = useParams();
  const productid = param.id;
  //find method returns the first element in the array that satisfies the provided testing function. 
  /* filter method returns all element in the array that satisfies the provided testing function
       so it is an array*/
  const product = allproducts.find(item => item._id === productid);
  const[productReviewById, setProductReviewById] = useState();
  const[loading, setLoading] = useState(false);

  

  const handleAddToCart = (product) => {
    dispatch(add(product));
    navigate('/cart');
  };

const handleClick = ()=>{
  navigate(-1);
}
const getReviewByProductId = async () => {
  setLoading(true);
  try {
    /* in get request can't send data from body so sent as params */
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/getreviewbyproductid`,
      {
        withCredentials: true,
        params: {
            productId: productid
    }}
    );
    if(response.data.success){
      setProductReviewById(response.data.data);
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
  getReviewByProductId();
}, []);
  
const averageRating = productReviewById?.length > 0
? productReviewById.reduce((total, item) => total + item.rating, 0) / productReviewById.length
: 0;


  return (
    <>
    {loading && < Loader/>}
    <section className="addcart-container">
      <div className="addcart-item">
        <div className='addcart-product-body'>
          <div className="card ms-3" style={{width: "10rem"}}>
            <img src={product?.image} className="addcart-img-top"/>
              <h6 className="addcart-body-title">{product?.title}</h6>
              <h6 className="addcart-newprice">${product?.new_price}<span className="addcart-oldprice">${product?.old_price}</span></h6>
          </div>
        </div>
        <div className='addcart-title-container'>
          <h3>{product?.title}</h3>
          <div>
      <p>rating({productReviewById?.length})</p>
      <div>Average Rating: <StarRating rating = {averageRating}/>
      </div>
      </div>
        </div>
        <div className='addcart-delivery-container'>
          <p className='add-delivery'>Delivery Options</p>
          <p className='addcart-delivery'>Standard Delivery- 2 to 3 days</p>
          <p className='addcart-delivery'>warranty not available</p>
        </div>
      </div>
      <button className='addtocart-btn' onClick={() => handleAddToCart(product)}>Add to Cart</button>
      <div>
      <button className='addcart-backbutton' onClick={handleClick}>&larr; Back to Shopping</button>
      </div>
      <div className='addcart-product-description'>
       <p><span>Product Details: </span>{product?.description}</p>
      </div>
      <div className='addcart-reviews-container'>
      <h5>Reviews and Rating({productReviewById?.length})</h5>
      <div className='addcart-averagetext'>Average Rating: <StarRating rating = {averageRating}/></div>
      <ul>
        {
          productReviewById?.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(item => (
            <li key={item._id}>
              {/*new Date(item.timestamp).toLocaleDateString() used to get just date from timestamp  */}
              <p>by {item.userName} on: <span className='addcart-datespan'>{item.createdAt.substring(0, 10)}</span></p>
              <div className='addcart-ratediv'>rating: < StarRating rating = {item.rating}/></div>
              <p className='addcart-ratediv'>{item.review}</p>
            </li>
          ))
        }
      </ul>
      </div>
    </section>
    </>
  );
}
export default AddCart;