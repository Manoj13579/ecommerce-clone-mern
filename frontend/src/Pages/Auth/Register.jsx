import React, { useRef, useState, useEffect } from "react";
import "./Auth.css";
import resetImg from "../../assets/reset.png";
import eyeoImg from "../../assets/eye-open.png";
import eyecImg from "../../assets/eye-close.png";
import { useLocation, useNavigate, } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { SET_ACCESS_TOKEN } from "../../Store/loginSlice";
import upload_image from "../../assets/upload_image.png";


const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};


const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photo: null,
    role: "user",
    authProvider: "jwt"
  });
  const query = useQuery();
   // 1 MB in bytes
  const MAX_FILE_SIZE = 1 * 1024 * 1024;
  

  useEffect(() => {
    const tokenParam = query.get('token');
    const emailParam = query.get('email');
    if (tokenParam && emailParam) {
      setFormData(prevState => ({
        ...prevState,
        email: emailParam
      }));
     } else {
      toast.error("Invalid password reset link");
    }
  }, []);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [cPassword, setCPassword] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

// defined handleFileChange here to check image size from frontend too.
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    /*The string 'image/jpeg' is a MIME type (Multipurpose Internet Mail Extensions type) used to specify the type of a file or data. MIME types are a way to tell the browser or server about the nature and format of a file or data being handled.
MIME Type: 'image/jpeg'
image: Indicates that the data is an image.
jpeg: Specifies the format of the image, which in this case is JPEG (Joint Photographic Experts Group). */
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    // file.type is here image type like image/jpeg
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, JPG, and PNG are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size should be less than 1 MB');
      return;
    }
    setFormData({ ...formData, photo: file });
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.password !== cPassword) {
    toast.error(`password don't match`);
    return;
  } 
  setButtonDisabled(true)
  try {
    
    let photoUrl = null;
    /* here using if (formData.photo) coz if no image uploaded in register so that still can proceed above. only if there is photo uploaded then only uploading with backend starts otherwise proceeds without it*/
    if (formData.photo) {
// when uploading file only could be sent through formData format to backend
const uploadFormData = new FormData();
// here sending image so "image" if video name it video
uploadFormData.append("image", formData.photo);


const photoUploadResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/usersignupuploads`, uploadFormData, {
 /* withCredentials: true, doesnot mean only when cookie is there then can proceed. it simply means if cookie is available send cookie with every request. doesnot make any difference here coz not logged in but good to include*/
  withCredentials: true,
});
// has two url use secure_url it is https another is http
photoUrl = photoUploadResponse.data.data.secure_url;
    }

   
   
   // Update formData with the image URL
   const updatedFormData = {
     ...formData,
     photo: photoUrl
   };
  // for to make axios send cookies request added { withCredentials: true }
  const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/signup`, updatedFormData, { withCredentials: true });
  // we are using sucess in backend so two data so need to acess with response.data
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
      name: "",
      email: "",
      password: "",
      photo: null,
      role: "user"
    });
    setCPassword("");
    toast.success("successfully registered");
    navigate("/cart");
    }
  } 
  catch (error) {
    /*If axios.post encounters a 400 status (which should happen if the email already exists), it might not directly throw an error that you catch in your catch block. Instead, axios might treat it as a valid response, and response.data might contain the JSON object { success: false, message: "existing user found with same email". so this approach */
    if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message); // Display backend error message
    } else {
        toast.error("Registration failed");
        console.log(error.message)
    }
    setButtonDisabled(false);
}
}



  const togglePasswordVisibility = () => {
    if (formData.password === "") {
      toast.warn(`password can't be empty`);
    } else {
      setShowPassword(!showPassword);
    }
  };

  const toggleCPasswordVisibility = () => {
    if (cPassword === "") {
      toast.warn(`password can't be empty`);
    } else {
      setShowCPassword(!showCPassword);
    }
  };

  return (
    <>
      <section className="register-container">
        <img src={resetImg} className="register-img" />
        <div className="form-container">
          <h3 className="register-text">Register</h3>
          <p className="register-text">input fields with * are required to be filled</p>
          <form onSubmit={handleSubmit} className="input-form">
            <span className="form-register-required">*</span>
            <input
              required
              placeholder="Enter Name"
              type="text"
              ref={inputRef}
              autoFocus
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            
            <span className="form-register-required">*</span>
            <div className="password-input-container">
              <input
                required
                placeholder="Enter Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
              />
              <img
                onClick={togglePasswordVisibility}
                src={showPassword ? eyeoImg : eyecImg}
                alt="Toggle Password Visibility"
                className="toggle-password"
              />
            </div>
            <span className="form-register-required">*</span>
            <div className="password-input-container">
              <input
                required
                placeholder="Confirm Password"
                type={showCPassword ? "text" : "password"}
                value={cPassword}
                onChange={(e) =>
                  setCPassword(e.target.value)}
              />
              <img
                onClick={toggleCPasswordVisibility}
                src={showCPassword ? eyeoImg : eyecImg}
                alt="Toggle Password Visibility"
                className="toggle-password"
              />
            </div>
            <p className="form-upload-text">image types allowed: jpeg|jpg|png</p>
            <p className="form-upload-text">image size shouldn't exceed 1 mb</p>
            <label htmlFor="file-input">
              {/* create url temporarily from image in local storage. creates own url and bcoz of this we see selected image in upload field */}
              <img src= {formData.photo? URL.createObjectURL(formData.photo): upload_image} className="form-register-addproduct-thumbnail-img"/>
              <input 
              type = "file" 
              onChange={handleFileChange}
              id="file-input"
              hidden
              />
            </label>
            <button type="submit" disabled={buttonDisabled}>Submit</button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Register;