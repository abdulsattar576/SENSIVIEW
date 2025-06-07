import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import infoslice from './Slice';
import { UserAuthApi } from '../services/UserAuthApi';
 import authReducer from './Authslice';

export const store = configureStore({
  reducer: {
    [UserAuthApi.reducerPath]: UserAuthApi.reducer,
    info: infoslice,
    auth: authReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(UserAuthApi.middleware),
});

setupListeners(store.dispatch);