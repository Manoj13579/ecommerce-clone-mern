import { createSlice } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';

/* cartSlice just used to pass products data from AddCart to Cart. Initializes initialState by parsing localStorage for key 'cart'. If it doesn't exist, defaults to an empty array.*/
const initialState = JSON.parse(localStorage.getItem('cart')) ?? [];

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    add(state, action){
      const product = state.find(item => item._id === action.payload._id);
     // product with this id exists
      if (product) {
        // increment same product by another 1
        // state.find has one product from state which includes entire state in this slice
        /* Since product represents a reference to the existing
         item in the state array (thanks to state.find), modifying
         product.cartquantity directly modifies the corresponding 
         item in the state array.*/
        product.cartquantity += 1;
      } else {
        // if no product need to push cartquantity on state array
        // state.push adds a new item to the cart when it doesn't already exist.
        // when addcart for first time new key/value pair cartquantity: 1 added on cart object or state
        state.push({ ...action.payload, cartquantity: 1 });
      }
    },
    remove(state, action){
      /* filter does not mutate original array only creates new array so need to return
      this array to cart array. here action.payload contains id passed from Cart.jsx
      */
     return state.filter(item => item._id !== action.payload);
      
    },
    incrementQuantity(state, action) {
      const product = state.find(item => item._id === action.payload);
      // cannot use >= coz if equal, it will allow to go to increment once
      if (product && product.quantity > product.cartquantity) {
         product.cartquantity += 1;
         
      }
     else {
      toast.warn("Sorry! no more stocks available");
     }
    },
    decrementQuantity(state, action) {
      const product = state.find(item => item._id === action.payload);
      if (product && product.cartquantity > 0) {
        product.cartquantity -= 1;
      }
      
    },
    // returns empty array so clears cart
    // no action needed to pass
    resetCart(state) {
      return [];
    }
  }
    
});

export const { add, remove, incrementQuantity, decrementQuantity, resetCart } = cartSlice.actions; 
export default cartSlice.reducer;