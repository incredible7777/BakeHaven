// Purpose: User Wishlist Redux Slice

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch user wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/wishlist");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load wishlist");
    }
  }
);

// Add item to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (cake, { rejectWithValue }) => {
    try {
      const res = await api.post("/wishlist", cake);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to wishlist");
    }
  }
);

// Update wishlist item quantity
export const updateWishlistQty = createAsyncThunk(
  "wishlist/updateWishlistQty",
  async ({ itemName, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.put("/wishlist/quantity", { itemName, quantity });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
    }
  }
);

// Remove item from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (itemName, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/wishlist/${encodeURIComponent(itemName)}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove from wishlist");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // addToWishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // updateWishlistQty
      .addCase(updateWishlistQty.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // removeFromWishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default wishlistSlice.reducer;