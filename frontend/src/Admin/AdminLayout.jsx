import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate} from 'react-router-dom';
import './Admin.css';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserCircle } from 'react-icons/fa';
import { GrBasket } from "react-icons/gr";
import { CiDeliveryTruck } from "react-icons/ci";
import { TbUsers } from "react-icons/tb";
import axios from 'axios';
import { toast } from'react-toastify';
import { CLEAR_ACCESS_TOKEN } from '../Store/loginSlice';
import ConfirmationModal from '../Utility/Modal/ConfirmationModal';
import { TbEdit } from "react-icons/tb";







const AdminLayout = () => {
   
    /* used TotalProduct as index of layout so status not used here(throws error). it is used in TotalProduct.setLoading too doesnot work coz using it in outlet*/
   const totalProduct = useSelector(state => state.products.data);
   const userinfo = JSON.parse(sessionStorage.getItem('userInfo'));
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const[allUserOrders, setAllUserOrders] = useState();
   const[allUsers, setAllUsers] = useState();
   const[openLogoutModal, setOpenLogoutModal] = useState();
    const activeLink = ({ isActive }) => (
        isActive ? 'adminLink' : ''
    );



    const handleLogout = () => {
      setOpenLogoutModal(true);
    }
    const handleConfirmLogout = async () => {

      try {
         /*even if in backend it expects refreshToken sent from cookies to logout even we don't send refreshToken from here by {} backend still receives refreshToken coz of { withCredentials: true } and only extracts refresh token(const { refreshToken } = req.cookies;) from sent cookies. { withCredentials: true } automatically sends both cookies  */
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/logout`, {}, { withCredentials: true });
            sessionStorage.removeItem('userInfo');
            dispatch(CLEAR_ACCESS_TOKEN());
            toast.success("Logged out successfully");
            navigate('/login');
      } 
      catch (error) {
        // server error
        if(error.response && (error.response.status === 400 || error.response.status === 500)) {
          toast.error(error.response.data.message)
        }
        else{
          // network or unexpected error
      toast.error("logout failed") 
      console.log(error.message);
       
      }
      }};


      const handleCancelLogout = () => {
        setOpenLogoutModal(false);
      }

const getAllUserOrders = async() => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getalluserorders`, { withCredentials: true })
      setAllUserOrders(response.data.data)
    }
    catch (error) {
      // server error
      if(error.response && error.response.status === 500) {
        toast.error(error.response.data.message)
      }
      else{
        // network or unexpected error
    toast.error("logout failed");
    console.log(error.message)
    }
}}
const getAllUsers = async() => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getallusers`, { withCredentials: true })
    if(response.data.success) {
      setAllUsers(response.data.data)
      
    }
  }
    catch (error) {
      // server error
      if(error.response && error.response.status === 500) {
        toast.error(error.response.data.message)
      }
      else{
        // network or unexpected error
    toast.error("logout failed");
    console.log(error.message)
    }
}
};

useEffect(() =>{
  getAllUserOrders();
  getAllUsers();
}, []);

const totalOrder = allUserOrders?.flatMap((products) => {
  return products.cartOrder.map((item) => item.length);
});


  return(
    <>
    <div className='admin-layout-container'>
      <h6 onClick={handleLogout} className='logout'>logout</h6>
      <div className='admin-info-container'>
      <div className='admin-info'>
      <span>{userinfo?.photo ? (<img className='admin-layout-profile-picture' src={userinfo?.photo} alt="User Photo" />) : <FaUserCircle size={70} />}<TbEdit onClick={() => navigate('/adminprofileedit')} style={{cursor: 'pointer'}}/></span>
      <h6>Hi {userinfo?.role}, welcome!</h6>
      <h6>email: {userinfo?.email}</h6>
      <h6>Registered On: {userinfo?.createdAt?.substring(0, 10)}</h6>
      </div>
      </div>
    <nav className='admin-navbar'>
    <NavLink to='.' end className={activeLink}><span><GrBasket size={40}/></span>
        <h5>{totalProduct?.length}</h5>
        <p>Total Product</p>
        </NavLink>
      <NavLink to='totalorder' className={activeLink}
      ><span><CiDeliveryTruck size={40}/>
      </span>
        <h5>{totalOrder?.length}</h5>
        <p>Total Order</p>
        </NavLink>
      <NavLink to='totalusers' className={activeLink}>
        <span><TbUsers size={40}/></span>
      <h5>{allUsers?.length}</h5>
      <p>Total User</p>
      </NavLink>
    </nav>
      <Outlet/>
    </div>
    <ConfirmationModal
  isOpen={openLogoutModal}
  message={"Are you sure you want to logout?"}
  onConfirm={handleConfirmLogout}
  onCancel={handleCancelLogout}
  />
    </>
  )
}

export default AdminLayout;