import { useRef, useState } from "react";
import "./Admin.css";
import loginImg from "../assets/login.png";
import eyeoImg from "../assets/eye-open.png";
import eyecImg from "../assets/eye-close.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import upload_image from "../assets/upload_image.png";




const AdminProfileEdit = () => {
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const userinfo = JSON.parse(sessionStorage.getItem('userInfo'));
    const [formData, setFormData] = useState({
      email: "",
      password: "",
      photo: null,
      adminId: userinfo?._id
    });

     // 1 MB in bytes
  const MAX_FILE_SIZE = 1 * 1024 * 1024;
  const inputRef = useRef();
  const navigate = useNavigate();

 
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
    setButtonDisabled(true);


    try {
  /* set photoUrl = null coz sending  const updatedFormData = { 
  ...formData,
      photo: photoUrl...
      in below won't throw error coz photoUrl is defined and updatedFormData is send in await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/userloginupload.... proceeds without photo upload */ 
      let photoUrl = null;
      /* here using if (formData.photo) coz if no image uploaded in register so that still can proceed above. only if there is photo uploaded then only uploading with backend starts otherwise proceeds without it*/
      if(formData.photo) {
      // when uploading file only could be sent through formData format to backend
 const uploadFormData = new FormData();
 // here sending image so "image" if video name it video
 uploadFormData.append("image", formData.photo);

 const photoUploadResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/userloginuploads`, uploadFormData, {
   withCredentials: true,
 });
 // has two url use secure_url it is https another is http
 photoUrl = photoUploadResponse.data.data.secure_url;
 // Update formData with the image URL
      }
   
    const updatedFormData = {
      ...formData,
      photo: photoUrl
    };
        // formData is defined as object above so can be sent without {}
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/adminprofileedit`, updatedFormData, { withCredentials: true})
        
        if(response.data.success){
          toast.success('successfuly updated profile');
           // Update session storage with the new user data. needed to get updated data instantly
           const updatedUserInfo = {
            ...userinfo,
            email: updatedFormData.email,
            // if the user didn't upload a new photo, keep the old one
            photo: photoUrl || userinfo.photo 
        };
        // Store the updated user info back into session storage in same name'userInfo'
    sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          setFormData({
            email: "",
            password: "",
            photo: null,
          });
          setFormData({
            email: "",
            password: "",
            photo: null,
          });
          navigate('/adminlayout')
        }
      }
    catch (error) {
        // server error
        if(error.response && (error.response.status === 500||error.response.status === 404||error.response.status === 400)) {
          toast.error(error.response.data.message)
        }
        else{
          // network or unexpected error
      toast.error("update failed");
      console.log(error.message)  
      }
      }
    setButtonDisabled(false);
  };



  const togglePasswordVisibility = () => {
    if (formData.password === "") {
      toast.warn(`password can't be empty`);
    } else {
      setShowPassword(!showPassword);
    }
  };

  return (
    <section className="admin-profile-register-container">
      <img src={loginImg} className="admin-profile-register-img" />
      <div className="admin-profile-form-container">
        <h3 className="admin-profile-register-text">Edit Profile</h3>
        {/* Allows users to submit the form by pressing the Enter key, improving user experience. */}
        <form onSubmit={handleSubmit} className="admin-profile-input-form">
          <input
            required
            ref={inputRef}
            autoFocus
            placeholder="Enter email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="admin-profile-password-input-container">
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
              className="admin-profile-toggle-password"
            />
          </div>
          <p className="adminproduct-form-upload-text">image upload is optional</p>
          <p className="adminproduct-form-upload-text">image types allowed: jpeg|jpg|png.</p>
            <p className="adminproduct-form-upload-text">image size shouldn't exceed 1 mb</p>
            <label htmlFor="file-input">
              {/* create url temporarily from image in local storage. creates own url and bcoz of this we see selected image in upload field */}
              <img src= {formData.photo? URL.createObjectURL(formData.photo): upload_image} className="adminproduct-addproduct-thumbnail-img"/>
              <input type = "file" 
               onChange={handleFileChange}
              id="file-input"
              hidden
              />
            </label>
          <button type="submit" disabled={buttonDisabled}>
            submit
          </button>
          <span onClick={() => navigate(-1)} className="admin-profile-cancel-button">
            cancel
          </span>
        </form>
      </div>
    </section>
  );
};

export default AdminProfileEdit;