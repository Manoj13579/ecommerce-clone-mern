import React, { useRef, useState } from "react";
import "./Auth.css";
import { FaGoogle } from "react-icons/fa";
import loginImg from "../../assets/login.png";
import eyeoImg from "../../assets/eye-open.png";
import eyecImg from "../../assets/eye-close.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch} from "react-redux";
import { SET_ACCESS_TOKEN } from "../../Store/loginSlice";



const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const inputRef = useRef();
  const navigate = useNavigate();

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    try {
      /*  { withCredentials: true } Send credentials (cookies) with the request.cookies sent.
      safe approach.since httpOnly: true, in token in backend javascript like document.cookies
      can't access token so we have to pass it like this. we can.t access token here through
      javascript so sent like this*/
      // formData is defined as object above so can be sent without {}
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/login`, formData, { withCredentials: true });
      
      
      if (response.data.success) {
        const { email, name, role, _id, createdAt, updatedAt, authProvider, photo } = response.data.user;
        dispatch(SET_ACCESS_TOKEN(
          {
          accessToken: response.data.accessToken
        }));
        sessionStorage.setItem("userInfo", JSON.stringify({
          email, 
          name, 
          role, 
          _id, 
          photo,
          createdAt,
          updatedAt,
          authProvider
      }));
        setFormData({
          email: "",
          password: ""
        });
        toast.success("sucessfully logged in");
        navigate(response.data.user.role === "user" ? "/cart" : "/adminlayout");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message)
      }
      else {
        toast.error("login failed");
        console.log(error.message)
      }
    }
    setButtonDisabled(false);
  };



  const handleGoogleLogIn = async () => {
      window.open(`${import.meta.env.VITE_API_BASE_URL}/auth/google/callback`, '_self')
};


  const togglePasswordVisibility = () => {
    if (formData.password === "") {
      toast.warn(`password can't be empty`);
    } else {
      setShowPassword(!showPassword);
    }
  };

  return (
    <section className="register-container">
      <img src={loginImg} className="register-img" />
      <div className="form-container">
        <h3 className="register-text">Login</h3>
        {/* Allows users to submit the form by pressing the Enter key, improving user experience. */}
        <form onSubmit={handleSubmit} className="input-form">
          <input
            required
            ref={inputRef}
            autoFocus
            placeholder="Enter email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="password-input-container">
            <input
              required
              placeholder="Enter Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <img
              onClick={togglePasswordVisibility}
              src={showPassword ? eyeoImg : eyecImg}
              alt="Toggle Password Visibility"
              className="toggle-password"
            />
          </div>
          <button type="submit" disabled={buttonDisabled}>
            submit
          </button>
        </form>
        <Link to="/password-resetrequest" className="register-opacity">
          Reset Password
        </Link>
        <p className="register-opacity">- - or - -</p>
        <button onClick={handleGoogleLogIn}className="login-bttn">
          <FaGoogle /> Log in with Google
        </button>
        <p>
          <span className="register-opacity">Don't have an Account ? </span>
          <Link to="/jwtemail-confirmation">Register</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
