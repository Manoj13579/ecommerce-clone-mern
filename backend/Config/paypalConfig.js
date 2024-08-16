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
          /*The toFixed() method in JavaScript is used to format a number to a specific number of decimal places. It returns a string representing the number in fixed-point notation. When you use toFixed(2), it ensures that the number has exactly two decimal places.const num1 = 3.14159;console.log(num1.toFixed(2)); // Output: "3.14". */
          value: totalValue.toFixed(2), // Total value of all items
          /* breakdown shows when clicked in price eg 100. breakdown breaks all items inside one package and shows value of one item that may have more then one quantity. this is required format by paypal api so need to include this if we include items as in below. */
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: totalValue.toFixed(2),
            },
          },
        },
        /* shows individual item but quantity shows total quantity of individual item. no need to add we get added quantity from frontend automatically */
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
  // use the cart information passed from the front-end to calculate the order amount detals
  /* when user clickes pay with paypal frontend send cart data and from here data passed to createOrder. createOrder
 can be defined here too.this created order is shown in paypal when user logs in.when user clicks complete purchase button in paypal capturePaypalOrder is initialized from frontend to here. */

  /*1. User Clicks "Pay with PayPal" Button
Frontend (React):
The user initiates the payment process by clicking the "Pay with PayPal" button.
This button is typically connected to a PayPal JavaScript SDK, which handles the client-side payment flow.
2. Create PayPal Order
Frontend (React):
The PayPal SDK triggers the creation of an order. This involves calling a backend API endpoint to create the order on PayPal's servers.
The frontend sends a request to the backend with the necessary payment details, such as the amount, currency, and any other metadata.here cartOrder.
Backend (Node.js/Express):
The backend receives the request and uses the PayPal REST API to create an order.
The backend sends a POST request to PayPal's /v2/checkout/orders endpoint.
PayPal responds with an orderID, which is then sent back to the frontend.
3. User Confirms Payment
Frontend (React):
The PayPal SDK handles the display of the PayPal checkout interface, where the user can log in and review the payment details.
The user confirms the payment within this interface.
Once confirmed, the frontend captures the order by making another request to the backend.
4. Capture the PayPal Order
Frontend (React):

The frontend sends a request to the backend to capture the payment.
This typically involves sending the orderID to a backend endpoint that is responsible for finalizing the payment.
Backend (Node.js/Express):

The backend receives the capture request and makes a POST request to PayPal's /v2/checkout/orders/{orderID}/capture endpoint.
PayPal processes the payment and returns a response indicating whether the capture was successful.
The backend can then perform any additional tasks, such as updating the database (MongoDB) with the transaction details, sending confirmation emails, etc.
5. Handle Payment Success or Failure
Backend (Node.js/Express):
If the payment is successful, the backend updates the order status in the database, and any relevant business logic is executed (e.g., updating inventory, generating a receipt).
If the payment fails, appropriate error handling is executed (e.g., logging the error, notifying the user, etc.).
Frontend (React):
The backend sends a response to the frontend indicating whether the payment was successful or failed.
Based on this response, the frontend can display a success message, redirect the user to a thank-you page, or show an error message with options to retry.
6. Complete the Transaction
Frontend (React):
The user is redirected to a final confirmation or thank-you page, confirming that the transaction has been completed successfully.
Backend (Node.js/Express):
Optionally, additional post-payment processes might occur, such as sending a confirmation email or notification to the user and the merchant.
Summary of Key Steps:
User clicks "Pay with PayPal."
Frontend requests backend to create a PayPal order.
Backend communicates with PayPal to create the order and returns orderID to the frontend.
User confirms payment on PayPal.
Frontend requests backend to capture the payment.
Backend captures the payment with PayPal and updates the order status.
Frontend informs the user of payment success or failure and redirects appropriately.
Transaction is complete, and any post-payment processes are handled.

The capture of payment is a crucial step in the PayPal payment process, especially when using the PayPal Orders API. This step is necessary to ensure that the payment is actually finalized and the funds are transferred from the buyer's PayPal account to the seller's account. Here's why capturing payment is needed:

1. Separation of Authorization and Capture:
Authorization: When a PayPal order is created and the user approves the payment, the funds are authorized but not yet transferred. This means that PayPal has verified that the buyer has sufficient funds or credit, and those funds are temporarily held or reserved, but they are not yet moved to the seller’s account.
Capture: The capture step is where the actual transfer of funds occurs. Once the payment is captured, the money is transferred from the buyer to the seller, completing the transaction.
*/
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
