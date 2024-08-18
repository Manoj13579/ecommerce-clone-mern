import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from 'react-toastify';
import axios from 'axios';
import { resetCart } from '../../Store/cartSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


const PaypalPayment = () => {
  
  const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const cartOrder = JSON.parse(localStorage.getItem("cart"));
  const order = JSON.parse(localStorage.getItem("order"));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Initial PayPal options
  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

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
  

  /* createOrder callback launches when the buyer selects a payment button. The callback starts the order and returns an order ID. After the buyer checks out using the PayPal pop-up, use this order ID to confirm when the payment is completed. */
  const createOrder = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders`,
        {
          cart: cartOrder
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const orderData = response.data;

      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : JSON.stringify(orderData);

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.log(error);
      toast.error(`Could not initiate PayPal Checkout...${error}`);
    }
  };

  /* after user authorizes payment capture payment starts, onApprove callback is launched from here and backend provides response. Use the onApprove response to update business logic, show a celebration page, or handle error responses. */
  const onApprove = async (data, actions) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders/${data.orderID}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const orderData = response.data;

      // error handled by copying paypal docs

      const errorDetail = orderData?.details?.[0];

      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
        return actions.restart();
      } else if (errorDetail) {
        throw new Error(
          `${errorDetail.description} (${orderData.debug_id})`,
        );
      } else {
        const transaction =
          orderData.purchase_units[0].payments.captures[0];
          // shows all order data in console upon transaction completion
        console.log(
          "Capture result",
          orderData,
          JSON.stringify(orderData, null, 2),
        );
        const userorder = {
          name: userinfo.name,
          email: order.email,
          mobile: order.mobile,
          district: order.district,
          address: order.address,
          status: order.status,
          userid: userinfo._id,
          payment: 'paid by paypal',
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
          // cam customize tast for single page too
          toast.success(`Transaction ${transaction.status}: ${transaction.id}, Order successfully placed with paypal payment`, { autoClose: false, position: 'top-center' });;
          navigate("/userorder");
        } catch (error) {
          toast.error("Payment succeeded, but there was an issue saving your order. Please contact support.");
        }
        
      }
    } catch (error) {
      console.log(error);
      toast.error(
        `Sorry, your transaction could not be processed`,
      );
    }
  };

  return (

    <div className='paypalpayment-container'>
      <h5>Choose PayPal payment to continue</h5>
      {/* paypal buttons here are javascript sdk so opens page automatically when clicked.
          PayPalButtons option provides two buttons. 
          PayPal Button: This allows users to log into their PayPal account and pay using their PayPal balance or linked bank account. Users can select this option to complete the transaction through their PayPal account.
          Debit or Credit Card Button: This option enables users to pay using a credit or debit card without requiring a PayPal account. When a user chooses this option, they are prompted to enter their card details directly on the payment form, and the transaction is processed without involving PayPal account credentials. 
      */}
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
        />
      </PayPalScriptProvider>
      </div>
  );
};
export default PaypalPayment;