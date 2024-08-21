import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import statusCode from "../Utility/statusCode";

export const getrefreshToken = createAsyncThunk('refreshToken/get', async () => {
  /*even if in backend it expects refreshToken sent from cookies to generate new refresh and access token even we don't send refreshToken from here by {} backend still receives refreshToken coz of { withCredentials: true } and only extracts refresh token(const { refreshToken } = req.cookies;) from sent cookies. { withCredentials: true } automatically sends both cookies  */
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/refresh-token`,{}, { withCredentials: true });
    return { 
      accessToken: response.data.accessToken,
    };
  } catch (error) {
    throw error;
  }
});

const initialState = {
  accessToken: null,
  status: statusCode.IDLE
};

const loginSlice = createSlice({
  name: "logintoken",
  initialState,
  reducers: {
    SET_ACCESS_TOKEN: (state, action) => {
      state.accessToken = action.payload;
    },
    SET_REFRESH_TOKEN: (state, action) => {
      state.accessToken = action.payload;
    },
    CLEAR_ACCESS_TOKEN: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getrefreshToken.pending, (state) => {
        state.status = statusCode.LOADING;
      })
      .addCase(getrefreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.status = statusCode.IDLE;
      })
      .addCase(getrefreshToken.rejected, (state) => {
        state.status = statusCode.ERROR;
      });
  }
});

export const { SET_ACCESS_TOKEN, SET_REFRESH_TOKEN, CLEAR_ACCESS_TOKEN } = loginSlice.actions;
export default loginSlice.reducer;