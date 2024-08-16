import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import statusCode from "../Utility/statusCode";
import "./Admin.css";
import Loader from "../Utility/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { deleteProduct, getProducts } from "../Store/productSlice";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmationModal from '../Utility/Modal/ConfirmationModal';


const TotalProduct = () => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Track which item to delete
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // runs in component mount and gets product
  useEffect(() => {
    dispatch(getProducts());
  }, []);
  const products = useSelector((state) => state.products.data);
  const status = useSelector((state) => state.products.status);
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

  const handleDelete = async (id) => {
    setItemIdToDelete(id); // Set the item ID to delete
    setIsOpen(true); // Open the confirmation modal
  };
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      /* since i am using req.body coz in controller defined like this so to send data this is the method.
      considered secured since id is not visible in params as in another method. if using params to send data
       we need to change both in backend and front end. here we had to pass 
       await axios.delete(`http://localhost:4000/deleteproduct/${id}`);*/
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/deleteproduct/`, {
        data: { itemIdToDelete },
        // no need to pass header coz using cookies.headers used to authenticate and send content type.withCredential works good for auth
        withCredentials: true,
      });
      dispatch(deleteProduct(itemIdToDelete));
      toast.success("product deleted sucessfully");
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 500)) {
         // server error 
        toast.error(error.response.data.message);
      } else {
        // network error or unexpected error
          toast.error("Deleting failed");
          console.log(error.message)
      }}
    setLoading(false);
    setIsOpen(false); 
    setItemIdToDelete(null);
  };
  
  const handleCancelDelete = () => {
    setIsOpen(false);
    setItemIdToDelete(null);
  };
  const handleAddProductClick = () => {
    navigate("/adminproducthandle");
  };

  const handleEdit = (
    productid,
    producttitle,
    productdescription,
    productcategory,
    productimage,
    productnewprice,
    productoldprice,
    productquantity
  ) => {
    navigate(
      `/adminproducthandle?id=${productid}&title=${producttitle}&description=${productdescription}&category=${productcategory}&image=${productimage}&new_price=${productnewprice}&old_price=${productoldprice}&quantity=${productquantity}`
    );
  };

  return (
    <>
      {loading && <Loader />}
      <section className="totalproduct-container">
        <div className="header">
          <h5>All Product</h5>
          <button onClick={handleAddProductClick}>Add Product</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Product</th>
              <th>Title</th>
              <th>Category</th>
              <th>New Price</th>
              <th>Old Price</th>
              <th>Quantity</th>
              <th>Action</th>
              <th>Added On</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {products
              // Make a shallow copy of the products array coz .sort method overwrites original array
              .slice()
              // date is in string format so changed to Date object to compare.
              //substracting date automatically changes to milliseconds and substracts it.
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((item, index) => (
                /*coz we are using dispatch(deleteProduct(id)); after axios.delete above it causes rerender after
       delete coz it dispatches to redux store. this needed to get latest after delete but before rerender
      takes some time n causes same id so using item_id not workins so used index in key*/
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="totalproduct-img">
                    <img src={item.image} alt="" />
                  </td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>${item.new_price}</td>
                  <td>${item.old_price}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="totalproduct-button-delete"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        handleEdit(
                          item._id,
                          item.title,
                          item.description,
                          item.category,
                          item.image,
                          item.new_price,
                          item.old_price,
                          item.quantity
                        )
                      }
                      className="totalproduct-button-edit"
                    >
                      Edit
                    </button>
                  </td>
                  {/* optional chaining ? ensures that if item.date or item.updatedDate is undefined, the expression returns undefined instead of trying to access substring. when Add Product it takes time to add date.*/}
                  <td>{item.createdAt?.substring(0, 10)}</td>
                  <td>
                    {item.updatedAt?.substring(0, 10)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
      {/* Confirmation Modal */}
     <ConfirmationModal
        isOpen={isOpen}
        message="Are you sure you want to delete this item?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default TotalProduct;
