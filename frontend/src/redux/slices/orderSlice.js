// Purpose: Orders & Cart Redux Slice with Item Count Incrementing, Removal on Zero & Checkout

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch all user orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/orders");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load orders");
    }
  }
);

// Place a new order or increment count in existing cart
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (items, { rejectWithValue }) => {
    try {
      const res = await api.post("/orders", { items });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to place order");
    }
  }
);

// Checkout/Finalize an order
export const checkoutOrder = createAsyncThunk(
  "orders/checkoutOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await api.put(`/orders/${orderId}/checkout`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to checkout order");
    }
  }
);

// Update quantity of an item in order (removes item if quantity is 0)
export const updateOrderQty = createAsyncThunk(
  "orders/updateOrderQty",
  async ({ orderId, itemName, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/orders/${orderId}/item`, { itemName, quantity });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
    }
  }
);

// Remove an order
export const removeOrder = createAsyncThunk(
  "orders/removeOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/${orderId}`);
      return orderId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove order");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createOrder (merges/updates existing pending order in place or unshifts new)
      .addCase(createOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
      })
      // checkoutOrder
      .addCase(checkoutOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // updateOrderQty (handles removed order when all items decremented to 0)
      .addCase(updateOrderQty.fulfilled, (state, action) => {
        if (action.payload && action.payload.removedOrder) {
          state.items = state.items.filter((o) => o._id !== action.payload._id);
        } else if (action.payload) {
          const index = state.items.findIndex((o) => o._id === action.payload._id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      })
      // removeOrder
      .addCase(removeOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o._id !== action.payload);
      });
  },
});

export default orderSlice.reducer;
