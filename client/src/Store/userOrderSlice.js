import { createSlice } from "@reduxjs/toolkit";
import statusCode from "../Utility/statusCode";





const initialState = {
    data: [],
    status: statusCode.IDLE,
}

const userOrderSlice = createSlice({
    name: 'userorder',
    initialState,
    reducers: {
        addOrder: (state, action) => {
            state.data.push(action.payload)
        },
        deleteOrder: (state, action) => {
           state.data = state.data.filter(d => d._id!== action.payload._id)
        },
        updateOrder: (state, action) => {
            const updateOrder = state.data.find(ind => ind._id === action.payload._id)
            if (updateOrder) {
                /* can also use ...state.data  while direct modification of the state works due to JavaScript's mutability, using the spread operator for updates ensures immutability and aligns with Redux best practices, leading to more maintainable and predictable code.*/
                    updateOrder.status= action.payload.status;
            }
        },
    },
});


export const { addProduct, deleteProduct, updateProduct } = userOrderSlice.actions;
export default userOrderSlice.reducer;