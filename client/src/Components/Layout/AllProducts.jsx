import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getProducts } from "../../Store/productSlice";
import statusCode from "../../Utility/statusCode";
import './Layout.css';
import Loader from "../../Utility/Loader/Loader";
import { useNavigate } from "react-router-dom";


const AllProducts = () => {
  const dispatch = useDispatch();

  
  const products = useSelector((state) => state.products.data);
  const status = useSelector((state) => state.products.status);
  const navigate = useNavigate();
  const [visibleProducts, setVisibleProducts] = useState(15);

  // runs in component mount and gets product
  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

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
   // Start by showing 15 products
  const handleShowMore = () => {
    // Increase by 12 on each click
    setVisibleProducts((prevVisible) => prevVisible + 15); 
  };
  return (
    <>
    <h5>Just Added</h5>
    <section className="allproducts-card-organize">
      {/* sorting is applied to the complete products list before you limit the visible products.Make a shallow copy of the products array using .slice() coz .sort method overwrites original array */}
      {products?.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, visibleProducts).map((products) => (
        <div key={products._id} className="allproducts-card-body">
            <div className="card ms-3" style={{ width: "8rem" }}>
              <img
                className="allproducts-card-img-top"
                src={products.image}
                onClick={() => { navigate(`addcart/${products._id}`);
                // scroll to up in addcart
                window.scrollTo(0, 0);
              }}
              />
              <div className="allproducts-card-body">
                <h6 className="allproducts-card-title">
                  {products.description.split(" ").slice(0, 9).join(" ")}
                </h6>
                <h6 className="allproducts-newprice">${products.new_price}<span className="allproducts-oldprice">${products.old_price}</span></h6>
              </div>
            </div>
        </div>
      ))}
    </section>
    {/* The "Show More Products" button is only rendered if there are more products available to show */}
    {visibleProducts < products.length && (
        <button onClick={handleShowMore} className="allproducts-showmore-button">Show More Products</button>
      )}
    </>
  );
};

export default AllProducts;