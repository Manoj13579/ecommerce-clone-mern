import React,{ useEffect } from 'react';
import './Admin.css';
import { useState } from 'react';
import Loader from '../Utility/Loader/Loader';
import { toast } from 'react-toastify';
import axios from 'axios';


const TotalUsers = () => {

  const[loading, setLoading] = useState(false);
  const[allUsers, setAllUsers] = useState();




  const getAllUsers = async() => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getallusers`, { withCredentials: true })
      if(response.data.success) {
        setAllUsers(response.data.data)
      }
  }
  catch (error) {
    // server error
    if(error.response && error.response.status === 404) {
      toast.error(error.response.data.message)
    }
    else{
      // network or unexpected error
  toast.error("logout failed");
  console.log(error.message)  
  }}
setLoading(false);
};

  useEffect(() =>{
    getAllUsers();
  }, []);




  return (
    <>
  {loading && <Loader />}
    <section className="totaluser-container">
    <h5>All User</h5>
    <table>
      <thead>
        <tr>
          <th>S.No.</th>
          <th>Name</th>
          <th>Email</th>
          <th>Auth</th>
          <th>uid</th>
          <th>Role</th>
          <th>Register Date</th>
        </tr>
      </thead>
      <tbody>
        {allUsers?.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((items, index) => (
          <tr key={items._id}>
          <td>{index+1}</td>
          <td>{items.name}</td>
          <td>{items.email}</td>
          <td>{items.authProvider}</td>
          <td>{items._id}</td>
          <td>{items.role}</td>
          <td>{items.createdAt.substring(0, 10)}</td>
        </tr>
        ))
        }
      </tbody>
    </table>
  </section>
  </>
  )
}

export default TotalUsers;