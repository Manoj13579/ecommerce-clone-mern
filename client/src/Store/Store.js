import { configureStore } from "@reduxjs/toolkit";
import productSlice from "./productSlice.js";
import loginSlice from "./loginSlice.js";
import filterSlice from "./filterSlice.js";
import cartSlice from "./cartSlice.js";
import userOrderSlice from "./userOrderSlice.js";



const Store = configureStore({
    reducer: {
        products: productSlice,
        logintoken: loginSlice,
        filter: filterSlice,
        cart: cartSlice,
        userorder: userOrderSlice,
    }
});


export default Store;