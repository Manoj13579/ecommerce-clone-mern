import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, getProducts, updateProduct } from "../Store/productSlice";
import "./Admin.css";
import { useNavigate, useLocation } from "react-router-dom";
import statusCode from "../Utility/statusCode";
import Loader from "../Utility/Loader/Loader";
import axios from "axios";
import { toast } from "react-toastify";
import upload_image from "../assets/upload_image.png";



const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const AdminProductHandle = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [new_price, setNew_Price] = useState(0);
  const [old_price, setOld_Price] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [editId, setEditId] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);
  const [uploadImage, setUploadImage] = useState();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = useQuery();
// 1 MB in bytes
const MAX_FILE_SIZE = 1 * 1024 * 1024;


  useEffect(() => {
    setTimeout(() => {
      inputRef.current.focus();
    }, 800);
    dispatch(getProducts());
    const itemId = query.get("id");
    const itemTitle = query.get("title");
    const itemDescription = query.get("description");
    const itemCategory = query.get("category");
    const itemImage = query.get("image");
    const itemNew_Price = query.get("new_price");
    const itemOld_Price = query.get("old_price");
    const itemQuantity = query.get("quantity");
    // Retrieves and sets edit item details if query parameters are present
    if (itemId) {
      setEditId(itemId);
      setTitle(itemTitle);
      setDescription(itemDescription);
      setCategory(itemCategory);
      setImage(itemImage);
      setNew_Price(itemNew_Price);
      setOld_Price(itemOld_Price);
      setQuantity(itemQuantity);
      setShowUpdate(true);
    }
  }, []);

  const products = useSelector((state) => state.products.data);
  const status = useSelector((state) => state.products.status);
  // Filters product by editId to get specific product details for update
  const getProductsById = products.filter((item) => item._id === editId);


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
      setUploadImage(file); // Directly set the file object
    }
  };
  
  /* using this only coz when  dispatch(getProducts()); getProducts runs or products is fetched
 from firestore. for others like  addDoc,updateDoc or delete or any other it doesnot work */
  if (status === statusCode.LOADING) {
    return <Loader />;
  }

  if (status === statusCode.ERROR) {
    return (
      <p className="error-state-error">
        Something went wrong !!! please try again later
      </p>
    );
  }
  const userInfo= JSON.parse(sessionStorage.getItem("userInfo"));
  const token = userInfo.accessToken;
  const resetFields = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setImage("");
    setNew_Price(0);
    setOld_Price(0);
    setQuantity(0);
    setShowUpdate(false);
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !description ||
      !category ||
      !new_price ||
      !old_price ||
      !quantity ||
      !uploadImage
    ) {
      toast.info("Please fill all fields.");
      return;
    }
    
    setLoading(true);
    
// when uploading file only could be sent through formData format to backend
    const formData = new FormData();
    // here sending image so "image" if video name it video
    formData.append("image", uploadImage);

    const imageUploadResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/adminuploads`, formData, {
      withCredentials: true,
    });
    // has two url use secure_url it is https another is http
    const imageUrl = imageUploadResponse.data.data.secure_url;
    

    /*response data (response.data) is directly accessible after await axios.post(...), so you can use it immediately without chaining .then(response). This approach is part of the power of async/await syntax. if async not used .then(response) is used. */
    // async used no need for prevent.Default().
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/addproduct`, {
        // Send data to the server in the request body which is typed in below field.
        /* axios automatucally sends headers likeContent-Type: application/json in post request so no need to mention. same to multipart/form-data(formdata along with images or videos) or formdata or images. others like get won't need this. Accept: application/json means return in this format or json format is not handled by axios but all api send this automatically so no need to mention in. only in rare case in some dependencies if it explicitly mentions to include it strictly then only but it doesnot happen in most cases so don't include.  */
        title,
        description,
        category,
        image: imageUrl,
        new_price,
        old_price,
        quantity,
        uploadImage
      },
        {
          withCredentials: true,
      });
      // if you don't dispatch entire object stored in single variable you need to pass id like this
      
      const id = response.data._id;
      dispatch(
        addProduct({
          _id: id,
          title,
          description,
          category,
          image: imageUrl,
          new_price,
          old_price,
          quantity,
        })
      );
      resetFields();
      toast.success("Product added successfully.");
      navigate(-1);
    } 
    catch (error) {  
      if (error.response && error.response.status === 400) {
          toast.error(error.response.data.message);
      } else {
          toast.error("adding product failed");
          console.log(error.message)
      }
  }
  setLoading(false);
};

  const handleUpdate = async () => {
    if (
      !title ||
      !description ||
      !category ||
      !new_price ||
      !old_price ||
      !quantity
    ) {
      toast.info("Please fill all fields.");
      return;
    }
    try {
/* initializing imageUrl with the current image state, which is existing image URL if no new image is selected.
It ensures that if no new image is selected (uploadImage is null or undefined), imageUrl retains the current value of image. This means if the user updates other fields but not the image, the existing image URL remains unchanged in the update request.*/
      let imageUrl = image;
// Check if uploadImage state has a value (meaning a new image was selected)
    if (uploadImage) {
      setLoading(true);
      // Upload the image and get the URL if a new image is selected
      /* uploadImage is the file object representing the image selected by the user.
A FormData object is created and the image file is appended to it.
An HTTP POST request is sent to the backend server’s /uploads endpoint to upload the image.
The Authorization header includes a token for authenticated access.
Once the image is uploaded, the server's response is expected to include the URL of the uploaded image, which is then stored in imageUrl. The file is usually sent as FormData, which is a special object that lets you build a set of key/value pairs representing form fields and their values. It supports sending files easily.
Multer processes multipart/form-data requests, which is the format used when uploading files through forms. It parses the incoming request and extracts the file data. so formData needed in uploading files*/
      const formData = new FormData();
      formData.append("image", uploadImage);
      const imageUploadResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/uploads`, formData, {
       withCredentials: true,
       headers: {
         Authorization: `Bearer ${token}`
        },
      });
      imageUrl = imageUploadResponse.data.data.secure_url;
    }
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/updateproducts`, {
        /*getProductsById is array so derived id like this.when id sent as request body
        it is sent like this */
        _id: getProductsById[0]._id,
        title,
        description,
        category,
        image: imageUrl,
        new_price,
        old_price,
        quantity,
      },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
      const id = response.data._id;
  
      dispatch(
        updateProduct({
          /*even we change _id to id or comment out all updateProduct here or in redux slice it still updates
          coz we rernder component mount in useEffect or axios put so getProducts get updated. but always 
          use redux dispatch with naming items similarly it is important even it works without it.*/
          _id: id,
          title,
          description,
          category,
          image: imageUrl,
          new_price,
          old_price,
          quantity,
        }
       )
      );
      resetFields();
      toast.success("Product updated successfully.");
      navigate(-1);
    } 
    catch (error) {
      
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
          toast.error(error.response.data.message);
      } 
      else {
          toast.error("update failed");
          console.log(error.message)
      }}
      setLoading(false);
  };

  const handleQuantity = (value) => {
    if (value < 0) {
      setQuantity(0);
    } else {
      setQuantity(value);
    }
  };
  const handleNew_Price = (value) => {
    if (value < 0) {
      setNew_Price(0);
    } else {
      setNew_Price(value);
    }
  };
  const handleOld_Price = (value) => {
    if (value < 0) {
      setOld_Price(0);
    } else {
      setOld_Price(value);
    }
  };
  return (
    <>
    {loading && <Loader />}
      <div className="adminproduct-handle-totalcontainer">
        {/* in {editId && <img src={getProductsById[0].image} />} However, the key point here is that filter() always returns an array, even if it contains only one element.
      So getProductsById is technically an array, even if it contains only one product object. That's why when you log getProductsById, you see an array with a single object.
      To access the product object directly, you would use getProductsById[0], because getProductsById is an array with one element (the filtered product object) */}
        {editId && (
          <section className="adminproduct-handle-card-organize">
            <div className="category-card-body">
              <div className="card ms-3" style={{ width: "13rem" }}>
                <img
                  src={getProductsById[0].image}
                  className="adminproduct-handle-card-img-top"
                  style={{ width: "57%" }}
                />
                <div className="adminproduct-handle-card-body">
                  <h6 className="category-card-title">
                    {getProductsById[0].description
                      .split(" ")
                      .slice(0, 9)
                      .join(" ")}
                  </h6>
                  <h6 className="adminproduct-handle-newprice">
                    ${getProductsById[0].new_price}
                    <span className="adminproduct-handle-oldprice">
                      ${getProductsById[0].old_price}
                    </span>
                  </h6>
                </div>
              </div>
            </div>
          </section>
        )}
        <section className="adminproduct-handle-container">
          <div className="adminproduct-handle-input-container">
            <p>Title</p>
            <input
              required
              ref={inputRef}
              type="text"
              placeholder="Enter Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p>Choose Category</p>
            <select
              required
              placeholder="Enter category"
              type="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="choose">Choose Category</option>
              <option value="women's clothing">women's clothing</option>
              <option value="men's clothing">men's clothing</option>
              <option value="jewellery">jewellery</option>
              <option value="electronics">electronics</option>
              <option value="bags">bags</option>
            </select>
            
            <p>Enter New Price</p>
            <input
              required
              type="number"
              placeholder="Enter New Price"
              value={new_price}
              onChange={(e) => handleNew_Price(Number(e.target.value))}
            />
            <p>Enter Old Price</p>
            <input
              required
              type="number"
              placeholder="Enter Old Price"
              value={old_price}
              onChange={(e) => handleOld_Price(Number(e.target.value))}
            />
            <p>Enter Quantity</p>
            <input
              required
              type="number"
              placeholder="Enter Quantity"
              value={quantity}
              onChange={(e) => handleQuantity(Number(e.target.value))}
            />
            <p>Enter Description</p>
            <textarea
              required
              type="text"
              rows="4"
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="adminproduct-form-upload-text">image types allowed: jpeg|jpg|png</p>
            <p className="adminproduct-form-upload-text">image size shouldn't exceed 1 mb</p>
            <label htmlFor="file-input">
              {/* create url temporarily from image in local storage. creates own url and bcoz of this we see selected image in upload field */}
              <img src= {uploadImage? URL.createObjectURL(uploadImage): upload_image} className="adminproduct-addproduct-thumbnail-img"/>
              <input type = "file" 
              onChange={handleFileChange}
              id="file-input"
              hidden
              />
            </label>
          </div>
          {!showUpdate ? (
            <button
              onClick={handleSubmit}
              className="adminproduct-handle-submit-update-btn"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              className="adminproduct-handle-submit-update-btn"
            >
              Update
            </button>
          )}
          <button
            onClick={resetFields}
            className="adminproduct-handle-submit-update-btn"
          >
            Cancel
          </button>
        </section>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="adminproduct-handle-backpage"
      >
        &larr; Back to admin page
      </button>
    </>
  );
};

export default AdminProductHandle;
