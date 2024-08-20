import axios from "axios";
import paypalGenerateAccessToken from "./paypalGenerateAccessToken.js";

const createOrder = async (cart) => {
  console.log(
    "shopping cart information passed from the frontend createOrder() callback:",
    cart
  );

  // Generate access token for PayPal API
  const accessToken = await paypalGenerateAccessToken();
  const url = `${process.env.PAYPAL_API_URL}/v2/checkout/orders`;

  const totalValue = cart.reduce((totalSum, item) => {
    return totalSum + item.new_price * item.cartquantity;
  }, 0);

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalValue.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: totalValue.toFixed(2),
            },
          },
        },
        
        items: cart.map((item) => ({
          name: item.title,
          unit_amount: {
            currency_code: "USD",
            value: item.new_price.toFixed(2),
          },
          quantity: item.cartquantity,
        })),
      },
    ],
    application_context: {
      // not showing shipping address in paypal
      shipping_preference: "NO_SHIPPING",
      // to give our app name instead of test store in paypal
      brand_name: "ecommerce-clone",
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('createOrder',response.data);
    
    return {
      jsonResponse: response.data,
      httpStatusCode: response.status,
    };
  } catch (error) {
    throw new Error(error.response?.data || error.message);
  }
};

const captureOrder = async (orderID) => {
  const accessToken = await paypalGenerateAccessToken();
  const url = `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`;

  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('captureOrder',response.data);
    return {
      jsonResponse: response.data,
      httpStatusCode: response.status,
    };
  } catch (error) {
    throw new Error(error.response?.data || error.message);
  }
};

const createPaypalOrder = async (req, res) => {
  
  try {
    const { cart } = req.body;
    const { jsonResponse, httpStatusCode } = await createOrder(cart);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
};

const capturePaypalOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
};

export { createPaypalOrder, capturePaypalOrder };
