import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    allProducts: [],
    filteredProducts: [],
}

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
      setAllProducts: (state, action) => {
        state.allProducts = action.payload;
        state.filteredProducts = action.payload;
      },
      filterProductsByPrice: (state, action) => {
        const lowToHigh = action.payload;
        // sort() method iterates over the elements of the array to perform the sorting
        state.filteredProducts = state.filteredProducts.sort((a, b) => {
          return lowToHigh ? a.new_price - b.new_price : b.new_price - a.new_price;
        });
      },
    },
  });
  


export const { setAllProducts, filterProductsByPrice } = filterSlice.actions;

export default filterSlice.reducer;