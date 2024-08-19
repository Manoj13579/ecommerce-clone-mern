import { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { getrefreshToken } from './Store/loginSlice.js';

// Pages
import Layout from "./Components/Layout/Layout";
import Carousel from "./Components/Layout/Carousel";
import ImageCategory from "./Components/Layout/ImageCategory"
import NotFound from "./Utility/NotFound";
import AllProducts from "./Components/Layout/AllProducts";
import AdminLayout from "./Admin/AdminLayout";
import TotalProduct from "./Admin/TotalProduct";
import TotalOrder from "./Admin/TotalOrder";
import TotalUsers from "./Admin/TotalUsers";
import AdminProductHandle from "./Admin/AdminProductHandle";
import AdminProfileEdit from "./Admin/AdminProfileEdit";
import Login from "./Pages/Auth/Login";
import Cart from "./Pages/Order/Cart";
import AdminProtectedRoute from "./protectedRoute/AdminProtectedRoute";
import UserProtectedRoute from "./protectedRoute/UserProtectedRoute";
import { useDispatch, useSelector } from "react-redux";
import PasswordResetRequest from "./Pages/Auth/PasswordResetRequest.jsx";
import ResetPassword from "./Pages/Auth/ResetPassword.jsx";
import GoogleLoginSuccess from "./Pages/Auth/GoogleLoginSuccess.jsx";
import JwtEmailConfirmation from "./Pages/Auth/JwtEmailConfirmation.jsx";
import Register from "./Pages/Auth/Register.jsx";
import UserProfileEdit from "./Pages/Auth/UserProfileEdit.jsx";
import SearchItems from "./Components/OtherComponents/SearchItems.jsx";
import AddCart from "./Pages/SinglePages/AddCart.jsx";
import Order from "./Pages/Order/Order.jsx";
import UserOrder from "./Pages/Order/UserOrder.jsx";
import PaypalPayment from "./Pages/Order/PaypalPayment.jsx";
import CategoryPage from "./Pages/SinglePages/CategoryPage.jsx";
import EsewaPaymentOrder from "./Pages/Order/EsewaPayment/EsewaPayment.jsx";
import VerifyEsewaResponse from "./Pages/Order/EsewaPayment/VerifyEsewaResponse.jsx";



const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path="/" element={<Layout />}>
      <Route
        index
        element={
          <>
            <Carousel />
            <ImageCategory />
            <AllProducts />
          </>
        }
      />
      <Route path="addcart/:id" element={<AddCart />} />
      <Route path="login" element={<Login />} />
      <Route path="google-login-success" element={<GoogleLoginSuccess />} />
      <Route path="password-resetrequest" element={<PasswordResetRequest />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="jwtemail-confirmation" element={<JwtEmailConfirmation />} />
      <Route path="register" element={<Register />} />
      <Route path="search" element={<SearchItems />} />
      <Route path="categorypage/:category" element={<CategoryPage />} />
      <Route element={<UserProtectedRoute />}>
      <Route path="cart" element={<Cart />}/>
      <Route path="order" element={<Order />}/>
      <Route path="userorder" element={<UserOrder />}/>
      <Route path="userprofileedit" element={<UserProfileEdit />} />
      <Route path="paypal-payment" element={<PaypalPayment />}/>
      <Route path="esewapayment" element={<EsewaPaymentOrder />} />
      <Route path="verify-esewa-response" element={<VerifyEsewaResponse />} />
      </Route>
    </Route>
    <Route element={<AdminProtectedRoute />}>
    <Route path="adminlayout" element={<AdminLayout />}>
      <Route index element ={<TotalProduct />}/>
      <Route path="totalorder" element={<TotalOrder />} />
      <Route path="totalusers" element={<TotalUsers />} />
      </Route>
      <Route path="adminproducthandle" element={<AdminProductHandle />} />
      <Route path="adminprofileedit" element={<AdminProfileEdit />} />
      </Route>
      <Route path="*" element={<NotFound />} />
      </>
  )
);

function App() {
  
const dispatch = useDispatch();
const aToken = useSelector((state) => state.logintoken.accessToken);
const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));



 /* whenever any page in app loads, page refreshed or after every 25 seconds if refreshToken has value or user is logged in this logic runs so refreshToken generates new acessToken. using JSON.parse(sessionStorage.getItem("userInfo")) will not work coz update in sessionStorage/local is slow and caouses errror. we have to keep something in dependency so that when it changes useEffect runs. reduxSlice is fast in updating. in page refresh userinfo from sessionStorage is still saved coz not logged out where it is removed so works here.whereas in page refresh both tokens are lostit is not used for logic that depends on updates */
  useEffect(() => {
      if (userinfo?.authProvider === 'jwt' && !aToken) {
        dispatch(getrefreshToken());
      } else if (aToken) {
        const intervalId = setInterval(() => {
          dispatch(getrefreshToken());
        }, 1000 * 25);
// clean up function of useEffect
/*When the interval is no longer needed (e.g., if the user logs out or the rToken changes), the cleanup function ensures that the interval is cleared. This prevents potential memory leaks and unnecessary calls to the getrefreshToken function, which could lead to unexpected behavior or performance issues. good to use cleanup in timeouts (like setInterval or setTimeout) */
        return () => {
          clearInterval(intervalId);
        };
      }
  }, [aToken, dispatch]);
  

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;