import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAllProducts, filterProductsByPrice } from "../../Store/filterSlice";
import './OtherComponent.css';
import statusCode from "../../Utility/statusCode";
import Loader from "../../Utility/Loader/Loader";

const SearchItems = () => {
  const { data, status } = useSelector((state) => state.products);
  const productsToFilter = useSelector(
    state => state.filter.filteredProducts
  );
  const location = useLocation();
  const dispatch = useDispatch();
  const searchKeyword = location.state;
  const navigate = useNavigate();
  

  useEffect(() => {
    const matchedItems = data.filter((item) => item.title === searchKeyword);
    // matched items dispatched to filterSlice
    dispatch(setAllProducts(matchedItems));
  }, [searchKeyword, dispatch]);

  const handleFilterByPrice = ((lowToHigh) => {
    dispatch(filterProductsByPrice(lowToHigh));
  });

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


  return (
    <section>
        <>
          {productsToFilter?.length > 0 && <div className="searchitems-dropdown">
            <button className="searchitems-dropbtn">
              Sort by: Price<i className="searchitems-arrowdown"></i>
            </button>
            <div className="searchitems-dropdown-content">
              <button onClick={() => handleFilterByPrice(true)}>
                Price Low to High
              </button>
              <button onClick={() => handleFilterByPrice(false)}>
                Price High to Low
              </button>
            </div>
          </div>}

          {productsToFilter?.length > 0 ? (
            <div className="searchitems-ul">
              <ul>
                <div className="searchitems-card-organize">
                  {productsToFilter.map((item) => (
                    <li key={item._id} className="searchitems-card-body">
                        <div className="card ms-3" style={{ width: "8rem" }}>
                          <img
                            src={item.image}
                            className="searchitems-card-img-top"
                            onClick={() => navigate(`/addcart/${item._id}`)}
                          />
                          <div className="searchitems-card-body">
                            <h6 className="searchitems-card-title">
                            {item.description.split(" ").slice(0, 9).join(" ")}
                            </h6>
                            <h6 className="searchitems-newprice">${item.new_price}<span className="searchitems-oldprice">${item.old_price}</span></h6>
                          </div>
                        </div>
                    </li>
                  ))}
                </div>
              </ul>
            </div>
          ) : (<div className="searchitems-sorry">
            <h3 >Sorry!</h3>
            <h3>No items found for: {searchKeyword}</h3></div>
          )}
          <Link to="/">
            <button className="searchitems-back-button">
              &larr; Back to Home Page
            </button>
          </Link>
        </>
    </section>
  );
};

export default SearchItems;