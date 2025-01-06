// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
// import {jwtDecode} from "jwt-decode";

// export const fetchUserData = createAsyncThunk("user/fetchUserData", async (_, { rejectWithValue }) => {
//   try {
//     const token = localStorage.getItem("authToken");
//     if (!token) throw new Error("Token không tồn tại");

//     const decoded = jwtDecode(token);
//     const accountId = decoded?.AccountID;
//     if (!accountId) throw new Error("Token không hợp lệ");

//     // Fetch account data
//     const accountRes = await axios.get(
//       `${process.env.REACT_APP_API_BASE_URL}/api/accounts/getById/${accountId}`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
//     const accountData = accountRes.data;

//     // Fetch user data
//     const userRes = await axios.get(
//       `${process.env.REACT_APP_API_BASE_URL}/api/User/get/${accountData.userId}`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const userData = userRes.data;
//     const avatarUrl = userData.avatar
//       ? `${process.env.REACT_APP_API_BASE_URL}/Uploads/${userData.avatar}`
//       : "";

//     return { isLoggedIn: true, avatarUrl, userData };
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });

// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     isLoggedIn: false,
//     avatarUrl: "",
//     userData: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     logout(state) {
//       state.isLoggedIn = false;
//       state.avatarUrl = "";
//       state.userData = null;
//       localStorage.removeItem("authToken");
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchUserData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchUserData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.isLoggedIn = true;
//         state.avatarUrl = action.payload.avatarUrl;
//         state.userData = action.payload.userData;
//       })
//       .addCase(fetchUserData.rejected, (state, action) => {
//         state.loading = false;
//         state.isLoggedIn = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { logout } = userSlice.actions;
// export default userSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const decoded = jwtDecode(token);
      const accountId = decoded?.AccountID;
      
      const accountResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/accounts/getById/${accountId}`
      );
      
      const userId = accountResponse.data.userId;
      const userResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/User/get/${userId}`
      );
      
      return userResponse.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New async thunk for updating avatar
export const updateAvatar = createAsyncThunk(
  'user/updateAvatar',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/User/update-avatar/${userId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      const avatarUrl = `${process.env.REACT_APP_API_BASE_URL}/Uploads/${response.data.avatar}`;
      return avatarUrl;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoggedIn: false,
    userData: null,
    avatarUrl: null,
    error: null,
    loading: false
  },
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.userData = null;
      state.avatarUrl = null;
      localStorage.removeItem('authToken');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.userData = action.payload;
        state.avatarUrl = action.payload.avatar ? 
          `${process.env.REACT_APP_API_BASE_URL}/Uploads/${action.payload.avatar}` : 
          null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.avatarUrl = action.payload;
        if (state.userData) {
          state.userData.avatar = action.payload.split('/').pop();
        }
      });
  }
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;