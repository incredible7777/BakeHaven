// Purpose: Master Redux Store Configuration

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
  },
});