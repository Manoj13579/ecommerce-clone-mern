import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { remove, incrementQuantity, decrementQuantity } from '../../Store/cartSlice';
import './Order.css';
import { toast } from 'react-toastify';

const Cart = () => {
  const products = useSelector(state => state.cart);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(products));
  }, [products]);

  const handleClick = () => {
    navigate(-1);
  };
  
  const handleContinueShopping = () => {
    navigate("/");
  };
  
  const removeFromCart = (id) => {
    dispatch(remove(id));
    toast.success("product deleted successfully")
  }

  const totalPrice = products.reduce((total, currentItem) => {
    return total + currentItem.new_price * currentItem.cartquantity;
  }, 0);
  
  const totalQuantity = products.reduce((total, currentItem) => {
    return total + currentItem.cartquantity;
  }, 0);
  
  const handleIncrement = (itemId) => {
    dispatch(incrementQuantity(itemId));
  }

  const handleDecrement = (itemId) => {
    dispatch(decrementQuantity(itemId));
  }

  return (
    <>
    {products?.length ? (<div className='cart-container'>
    <section className='cart-left'>
      <h6 className='cart-product-h'>Your Cart Items:</h6>
      {products.map((product) => (
        <ul className='cart-container-ul' key={product._id}>
          <li>
            <img className='cart-item-img' src={product.image} alt={product.title} />
            <h5 className='cart-price'>${product.new_price}</h5>
          </li>
          <div className='cart-increment'>
            <button onClick={() => handleDecrement(product._id)}>-</button>
            {product.cartquantity}
            <button onClick={() => handleIncrement(product._id)}>+</button>
          </div>
          <button onClick={() => removeFromCart(product._id)} className='cart-delete-img'>
            <img src={'/delete.png'} alt="delete" />
          </button>
        </ul>
      ))}
      <button className='cart-back' onClick={handleContinueShopping}>&larr; Continue Shopping</button>
      <button className='cart-back' onClick={handleClick}>&larr; Back to AddCart</button>
    </section>
    <section className='proceed-container'>
    <h6>Order Summary</h6>
    <p className='proceed-total'>Subtotal ({totalQuantity}items): <span>${totalPrice}</span></p>
    <p className='proceed-total'>Shipping fee <span>free</span></p>
    <p className='proceed-total'>Total-
      <span>${totalPrice}</span></p>
    <button className='proceed-button' onClick={() => navigate("/order")}>proceed to checkout({totalQuantity})</button>
    </section>
    </div>) : <><h4>Your Cart is Empty</h4>
    <button className='cart-back' onClick={handleContinueShopping}>&larr; Add to Cart </button></>
    }
    </>
  );
};

export default Cart;