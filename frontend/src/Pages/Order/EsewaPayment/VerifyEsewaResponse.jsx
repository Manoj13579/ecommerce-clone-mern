import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { resetCart } from '../../../Store/cartSlice';




const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };



const VerifyEsewaResponse = () => {

const query = useQuery();
const encodedResponse = query.get('data');
const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const cartOrder = JSON.parse(localStorage.getItem("cart"));
  const order = JSON.parse(localStorage.getItem("order"));
  const dispatch = useDispatch();
  const navigate = useNavigate();



/* this function used coz if transaction of paypal completes there might be network or other error in trying  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/adduserorder`. so if error tries for three times. */
const saveOrder = async (userorder) => {
    
    const maxRetries = 3;
    /* if the response indicates success (response.data.success). If it is successful, the function immediately returns true. This return statement exits the function and prevents any further iterations or retries. so if sucess in 1st attempt doesnot go for second*/
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/adduserorder`, { userorder }, { withCredentials: true });
        if (response.data.success) {
          return true;
        }
      } catch (error) {
         // If this was the last attempt, throw an error
        if (attempt === maxRetries) {
          throw new Error("Failed to save order after multiple attempts.");
        }
        // Optionally, you could add a delay here before retrying. 1 second delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

    
    

    useEffect( () => {
        console.log("Component mounted");
        const verifyingResponse = async () => {
          try {
              const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/verify-esewa-response`, {
                  encodedResponse: encodedResponse
              }, { withCredentials: true });
      
              if (response.data.success) {
                  const userorder = {
                      name: userinfo.name,
                      email: order.email,
                      mobile: order.mobile,
                      district: order.district,
                      address: order.address,
                      status: order.status,
                      userid: userinfo._id,
                      payment: 'paid by esewa',
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
                      await saveOrder(userorder);
                      localStorage.removeItem("cart");
                      dispatch(resetCart());
                      // cam customize toast for single page too
                      toast.success("Order successfully placed with esewa payment", { autoClose: false, position: 'top-center' });
                      navigate("/userorder");
                    } catch (error) {
                      console.log("payment succeeded, but there was an issue saving your order", error);
                      
                      toast.error("Payment succeeded, but there was an issue saving your order. Please contact support.");
                    }
                    
              } else {
                  toast.error('Transaction verification failed');
              }
          } catch (error) {
              console.error('Error during transaction verification:', error);
              toast.error('Error during transaction verification');
          }
      };
        verifyingResponse();
    }, [])


  return (
    <div>
      
    </div>
  )
}

export default VerifyEsewaResponse;
