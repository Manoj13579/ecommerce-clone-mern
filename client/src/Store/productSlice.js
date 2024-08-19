import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import statusCode from "../Utility/statusCode";
import axios from "axios";




const initialState = {
    data: [],
    status: statusCode.IDLE,
}
// products/get just naming convention can name anything
const getProducts = createAsyncThunk('products/get', async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api`);
        /* Axios automatically parses JSON response so as fetch Api(built in)
        no need to change to json like response.json(); */
        return response.data;
    } catch (error) {
        /* both network and server error is thrown and state.status = statusCode.ERROR; in extraReducers will show error where getProducts is dispatched.*/
        throw error;
    }
});

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
      addProduct: (state, action) => {
      state.data.push(action.payload);
    },
    deleteProduct: (state, action) => {
        state.data = state.data.filter(item => item._id !== action.payload)
    },
    updateProduct: (state, action) => {
    const productUpdate = state.data.find(item => item._id === action.payload._id)
       if(productUpdate) {
        productUpdate._id= action.payload._id;
        productUpdate.title = action.payload.title;
        productUpdate.description = action.payload.description;
        productUpdate.category = action.payload.category;
        productUpdate.image = action.payload.image;
        productUpdate.new_price = action.payload.new_price;
        productUpdate.old_price = action.payload.old_price;
        productUpdate.quantity = action.payload.quantity;
        }
    }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.pending, (state, action) => {
                state.status = statusCode.LOADING;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.data = action.payload;
                state.status = statusCode.IDLE;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.status = statusCode.ERROR;
            });
    }
});

export { getProducts };
export const { addProduct, deleteProduct, updateProduct } = productSlice.actions;
export default productSlice.reducer;
