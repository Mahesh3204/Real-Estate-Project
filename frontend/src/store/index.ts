import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import loaderReducer from './loaderSlice';
import toastReducer from './toastSlice';
import propertyReducer from './propertySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loader: loaderReducer,
    toast: toastReducer,
    property: propertyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
