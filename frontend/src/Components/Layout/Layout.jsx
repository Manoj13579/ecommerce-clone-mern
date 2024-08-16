// after react 18 it is not necessary to import react.choice is yours
import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import './Layout.css';
import Footer from '../Footer/Footer';
import { IoSearchOutline, IoPersonOutline } from "react-icons/io5";
import { BsGlobe, BsCart } from "react-icons/bs"
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../Store/productSlice';
import axios from 'axios';
import { CLEAR_ACCESS_TOKEN } from '../../Store/loginSlice';
import { toast } from 'react-toastify';





const Layout = () => {
  

 

  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartProducts = useSelector(state => state.cart);
    const allproducts = useSelector(state => state.products.data);
    const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
    
    
    
    
/* not using status === statusCode.LOADING coz it's already used in AllProducts.jsx and it is outlet of this component can't use it twice throws error of loader pending and fulfilled continously. if error occurs in fetching getProducts() error handling in  AllProducts.jsx works here too*/
    useEffect(() => {
      dispatch(getProducts())
    }, []);

    const searchedProducts = allproducts
    /* obj.title.toLowerCase() converts user entered title to lower case. startsWith(searchTerm.toLowerCase() converts. if the product matches searchTerm it's title that starts with the user's searchTerm is converted to lower case 
    Only products that meet this criterion will be included in the resulting array.Only the products that match this condition are kept*/
    .filter(obj => obj.title.toLowerCase().startsWith(searchTerm.toLowerCase()))
    /* reduce(): This method is used to accumulate values into a single output.uniqueProducts is accumulator current holds value. The current variable in the reduce function represents each product in this filtered array during the iteration.The uniqueProducts accumulator will eventually hold the unique products after processing all the current products from the filteredProducts array.[], initializes the uniqueProducts accumulator as an empty array. It will be filled with unique products as the method iterates through the filteredProducts.*/
    .reduce((uniqueProducts, current) => {
        // Check if the current title already exists in the uniqueProducts array
        const isDuplicate = uniqueProducts.find(item => item.title === current.title);
        // If it's not a duplicate, add it to the uniqueProducts array. if duplicate not added
        if (!isDuplicate) {
            uniqueProducts.push(current);
        }
        /*By returning uniqueProducts, you're passing the updated array (which may now contain one more unique product) back to reduce for the next iteration. This way, uniqueProducts keeps accumulating unique products as reduce continues to process each element in the array. */
        return uniqueProducts;
    }, [])
    .slice(0, 8); // Limit to the first 8 unique products
  
    
  const activeLink = ({isActive}) => {
  return isActive ? 'activeLink' : '';
  };



 const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchTerm === ""){
      toast.warn("cannot have blank search")
    }
    else{
    navigate('search', { state:searchTerm });
    setSearchTerm("");
  }};

  const handleLogout = async () => {
    try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/logout`, {}, { withCredentials: true });
        sessionStorage.removeItem('userInfo');
        dispatch(CLEAR_ACCESS_TOKEN());
        toast.success("Logged out successfully");
        navigate('/login');
      

    } 
    catch (error) {
      toast.error(`Logout failed try again`);
      console.log(error.message)
        } 
    }

  
  const handleGoogleLogout = async () =>{
    
    try {
      await  axios.post(`${import.meta.env.VITE_API_BASE_URL}/googlelogout`, {}, {
        withCredentials: true
      })
        sessionStorage.removeItem('userInfo');
        navigate('/login')
        toast.success("logged out successfully")
      }
    catch (error) {
      toast.error("error in logout try again");
      console.log(error)
    }
  }


  const totalQuantity = cartProducts.reduce((total, currentItem) => {
    return total + currentItem.cartquantity;
  }, 0);


  
  return (
  <>
  <div className="top-navbar">
          <NavLink to='adminlayout'>admin</NavLink>
          <a href="#">Help & Support</a>
          <a href="#">Daraz Logistics Partner</a>
  </div>
<nav className="secondnavbar-container">
<Link to='/'><h3>Daraz</h3></Link>
<form onSubmit={handleSearchSubmit} className='inputsecondnavbar-wrapper'>
    <input className='input-secondnavbar'
        type="search" 
        placeholder="Search in Daraz" 
        aria-label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* search dropdown */}
        {searchTerm && searchedProducts?.length > 0 ? (
  <div className="navbarsearch-dropdown">
    {
      searchedProducts?.map((item) => (
        <div
        key={item._id}
        className="navbarsearch-item"
        onClick={() => {
          navigate('search', { state: item.title });
          setSearchTerm("");
        }}
        >
          {item.title}
        </div>
      ))
    }
  </div>
) : ("")}
      <button  type = 'submit' className='navbarsearch-button'><IoSearchOutline className="bi bi-search"/>
      </button>
      </form>
     <div className="right-items-navbar">
      {/* display on logout */}
      {/* just wrapped each item under individual {isAnyPropertyNull && just for space around of  right-items-navbar
      can use under one div and one {isAnyPropertyNull &&*/}
     {!userinfo && <IoPersonOutline className="text-white h4 mt-2"/>}
     {!userinfo && <span className='layout-navlink'><NavLink to='login' className={activeLink}>login</NavLink></span>}
     {!userinfo && <h4 className='navbarbtn-divider'>|</h4>}
     {!userinfo && <span className='layout-navlink'><NavLink to='/jwtemail-confirmation' className={activeLink}>signup</NavLink></span>}

      {/* can use custom css in bootstrap if needed. */}
     {/* display on login */}
    {userinfo?.authProvider === "jwt" && 
      <div className="layout-dropdown">
        {userinfo?.photo ? (<img className='layout-profile-picture' src={userinfo?.photo} />) : (<div className='layout-dropdown-p'>{userinfo?.name.charAt(0).toUpperCase()}</div>)}
      <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      Hello, {userinfo?.name}
      </button>
      <ul className="dropdown-menu">
        <li><Link className={`dropdown-item ${activeLink}`}to='userorder'>My Order</Link></li>
        <li><Link className={`dropdown-item ${activeLink}`}to='userprofileedit'>Edit Profile</Link></li>
        <li><p onClick={handleLogout}className="dropdown-item">logout</p></li>
      </ul>
    </div>}
       {/* display on google login */}
      {userinfo?.authProvider === "google" && 
      <div className="layout-dropdown">
       <p>{<img src={userinfo?.photo} className='layout-profile-picture' />}</p>
      <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      Hello, {userinfo?.name}
      </button>
      <ul className="dropdown-menu">
        <li><Link className={`dropdown-item ${activeLink}`}to='userorder'>My Order</Link></li>
        <li><p onClick={handleGoogleLogout}className="dropdown-item">logout</p></li>
      </ul>
    </div>
      }
        
<BsGlobe className="text-white"/>


      <ul className="navbar-nav ms-2">
        <li className="nav-item dropdown">
          <a className="nav-link text-white dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            EN
          </a>
          <ul className="dropdown-menu">
            <li className='text-muted ms-3'><h6><small>select language</small></h6></li>
            <li><a className="dropdown-item text-muted" href="#"><h6><small>English</small></h6></a></li>
            <li><a className="dropdown-item text-muted" href="#"><h6><small>Nepali</small></h6></a></li>
          </ul>
        </li>
      </ul>
     <Link to="/cart" className='navbar-cart-link'><BsCart className="text-white h3 ms-4"/>
     {userinfo &&<span className='navbar-cartproducts-quantity'>{totalQuantity}</span>}
</Link>
      </div>
</nav>

<Outlet />
<Footer />
</>
  )
}

export default Layout;