import React, { useState, useEffect } from 'react';
import './Auth.css';
import { toast } from "react-toastify";
import resetImg from '../../assets/reset.png';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';



const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};


const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const query = useQuery();
  

  useEffect(() => {
    const tokenParam = query.get('token');
    const emailParam = query.get('email');
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
     } else {
      toast.error("Invalid password reset link");
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/reset-password`, { password, token, email });
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error.response?.data?.message)
    }
    setButtonDisabled(false);
    setPassword('');
  }

  return (
    <section className='register-container'>
      <img src={resetImg} className='register-img' alt='Reset Password' />
      <div className='form-container'>
        <h3 className='register-text'>Reset Password</h3>
        <form onSubmit={handleSubmit} className='input-form'>
          <div className='password-input-container'>
            <input
              required
              placeholder='Enter Password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type='submit' disabled={buttonDisabled}>Submit</button>
        </form>
        <Link to='/login' className='register-opacity'>Login</Link>
        <Link to='/jwtemail-confirmation' className='register-opacity'>Register</Link>
      </div>
    </section>
  )
}

export default ResetPassword;