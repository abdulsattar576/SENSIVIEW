// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const AuthSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    isLoading: true,
  },
  reducers: {
    setAuthState: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = action.payload.isLoading || false;
    },
  },
});

export const { setAuthState } = AuthSlice.actions;
export default AuthSlice.reducer;