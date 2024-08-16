import React, { useState, useEffect, useRef } from "react";
import './Order.css';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../Utility/Loader/Loader.jsx";
import { useDispatch } from 'react-redux';
import { resetCart } from '../../Store/cartSlice';
import axios from "axios";
/* look structure in this page for how userorder is set. imp coz this makes delete individually of order items possible. and also answers confussion of different id */


const Order = () => {
  
  const [order, setOrder] = useState({
    email: "",
    // good to keep mobile to string to handle various phone number formats
    mobile: "",
    district: "",
    address: "",
    status: "processing",
  });

  const [paymentMethod, setPaymentMethod] = useState('cashondelivery');
  const [loading, setLoading] = useState(false);
  const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const navigate = useNavigate();
  const cartOrder = JSON.parse(localStorage.getItem("cart"));
  const dispatch = useDispatch();
  const inputRef = useRef();
 
  // Store order details in localStorage when `order` state changes.or user inputs
  useEffect(() => {
    localStorage.setItem("order", JSON.stringify(order));
  }, [order]);
  
  useEffect(() => {
    /*after adding user order or while in ordering no need to set it to localStorage now.will short cart 0 after order */
    if(loading){
    localStorage.removeItem("cart");
      dispatch(resetCart());}
    }, [loading]);
    
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (paymentMethod === 'cashondelivery') {
        placeOrder();
      } else if (paymentMethod === 'paypal') {
        proceedWithPayPal();
      }
    };
    

  const placeOrder = async () => {
  
    const userorder = {
      name: userinfo.name,
      email: order.email,
      mobile: order.mobile,
      district: order.district,
      address: order.address,
      status: order.status,
      userid: userinfo._id,
      payment:'cash on delivery', 
      // cartOrder is array so need to use map to get data
      cartOrder: cartOrder?.map((product) => ({
        productid: product._id,
        title: product.title,
        quantity: product.quantity,
        image: product.image,
        description: product.description,
        category: product.category,
        price: product.new_price,
        orderedQuantity: product.cartquantity,
      })),
    };
  
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/adduserorder`, { userorder }, { withCredentials: true });
      if (response.data.success) {
        setOrder({
          email: "",
          mobile: "",
          district: "",
          address: "",
        });
        navigate("/userorder");
        toast.success("Order successfully placed");
      }
    }
    catch (error) {
      // server error
      if(error.response && (error.response.status === 400 || error.response.status === 404 || error.response.status === 500)) {
        toast.error(error.response.data.message)
      }
      else{
        // network or unexpected error
    toast.error("logout failed");
    console.log(error.message)  
    }
    setLoading(false);
  }
};


const proceedWithPayPal = () => {
  // Implement PayPal payment process here
  // Redirect to PayPal checkout or initiate PayPal payment flow
  navigate("/paypal-payment");
};

/* price *(multiply) quantity won't work coz we have to calculate more 
then one items inside a cart. */
  const totalPrice = cartOrder.reduce((total, currentItem) => {
    return total + currentItem.new_price * currentItem.cartquantity;
  }, 0);
  
  const totalQuantity = cartOrder.reduce((total, currentItem) => {
    return total + currentItem.cartquantity;
  }, 0);

  return (
    <>
    <section className="order-container">
      {loading && <Loader />}
        <div className="orderform-container">
          <h3 className="orderform-text">Shipping Info:</h3>
          <form onSubmit={handleSubmit} className="order-form">
            <input
              required
              ref={inputRef}
              autoFocus
              placeholder="Enter contact email"
              type="email"
              value={order.email}
              onChange={(e) =>
                setOrder({
                  ...order,
                  email: e.target.value,
                })
              }
            />
            <input
              required
              placeholder="Enter mobile"
              type='text'
              value={order.mobile}
              onChange={(e) =>
                setOrder({
                  ...order,
                  mobile: e.target.value,
                })
              }
            />
            <input
              required
              placeholder="Enter district"
              type="text"
              value={order.district}
              onChange={(e) =>
                setOrder({
                  ...order,
                  district: e.target.value,
                })
              }
            />
            <input
              required
              placeholder="Enter Address"
              type="text"
              value={order.address}
              onChange={(e) =>
                setOrder({
                  ...order,
                  address: e.target.value,
                })
              }
            />
            <div className="order-payment-method-container">
    <label>
      <input
        type="radio"
        value="cashondelivery"
        checked={paymentMethod === 'cashondelivery'}
        onChange={(e) => setPaymentMethod(e.target.value)}
      />
  <span className="order-payment-method-container-text">Cash on Delivery</span>
    </label>
    <label>
      <input
        type="radio"
        value="paypal"
        checked={paymentMethod === 'paypal'}
        onChange={(e) => setPaymentMethod(e.target.value)}
      />
     <span className="order-payment-method-container-text">Pay with PayPal</span>
     </label>
  </div>
            <button type="submit">Place Order</button>
          </form>
        </div>
      <div className='order-proceed-container'>
    <h6>Order Summary</h6>
    <p className='order-proceed-total'>Subtotal ({totalQuantity}items): <span>${totalPrice}</span></p>
    <p className='order-proceed-total'>Shipping fee <span>free</span></p>
    <p className='order-proceed-total'>Total-
      <span>${totalPrice}</span></p>
    </div>
    </section>
        <h6 className="ordercart-product-h">Your Order:</h6>
        {cartOrder?.map((product) => (
          <div className="ordercart-container" key={product._id}>
              <img
                className="ordercart-item-img"
                src={product.image}
                alt={product.title}
              />
              <h6 className="ordercart-price">price: <span>${product.new_price}</span></h6>
              <h6 className="ordercart-price">quantity: <span>{product.cartquantity}</span></h6>
          </div>
        ))}
        <button onClick={() => navigate("/cart")} className="ordercart-back">&larr; go back to cart</button>
    </>
  );
};

export default Order;