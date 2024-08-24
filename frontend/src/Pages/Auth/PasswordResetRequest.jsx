import { useState } from 'react';
import './Auth.css';
import { toast } from "react-toastify";
import resetImg from '../../assets/reset.png';
import { Link } from 'react-router-dom';

import axios from 'axios';

const PasswordResetRequest = () => {
  const [email, setEmail] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/request-passwordreset`, { email });
      toast.success(response.data.message, {autoClose: false, position: 'top-center'});
    } catch (error) {
      toast.error( "Something went wrong");
      console.log(error.response?.data?.message)
    }
    setButtonDisabled(false);
    setEmail('');
  };

  return (
    <section className='register-container'>
      <img src={resetImg} className='register-img' alt='Reset Password' />
      <div className='form-container'>
        <h3 className='register-text'>Reset Password</h3>
        <form onSubmit={handleSubmit} className='input-form'>
          <div className='password-input-container'>
            <input
              required
              placeholder='Enter Email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type='submit' disabled={buttonDisabled}>Submit</button>
        </form>
        <Link to='/login' className='register-opacity'>Login</Link>
        <Link to='/jwtemail-confirmation' className='register-opacity'>Register</Link>
      </div>
    </section>
  );
};

export default PasswordResetRequest;