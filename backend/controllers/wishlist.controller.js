// Purpose: User Wishlist Management
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

//purpose: add item to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { name, price, image, description, quantity } = req.body;

  if (!name) {
    throw new ApiError(400, "Cake name is required for wishlist");
  }

  const user = await User.findById(req.user._id);

  // Check if item already in wishlist
  const itemExists = user.wishlist.some((item) => item.name === name);
  if (itemExists) {
    return res
      .status(200)
      .json(new ApiResponse(200, user.wishlist, "Item already in wishlist"));
  }

  // Add item
  user.wishlist.push({
    name,
    price: price || 0,
    image: image || "/image/c1.png",
    description: description || "",
    quantity: quantity || 1,
  });

  await user.save();

  return res
    .status(201)
    .json(new ApiResponse(201, user.wishlist, "Item added to wishlist"));
});

//purpose : get user wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, user.wishlist, "Wishlist retrieved successfully"));
});


//purpose : update wishlist quantity using body
export const updateWishlistQuantity = asyncHandler(async (req, res) => {
  const { itemName, quantity } = req.body;

  if (!itemName || quantity === undefined || quantity < 1) {
    throw new ApiError(400, "Valid itemName and quantity (>= 1) are required");
  }

  const user = await User.findById(req.user._id);
  const item = user.wishlist.find((i) => i.name === itemName);

  if (!item) {
    throw new ApiError(404, "Item not found in wishlist");
  }

  item.quantity = quantity;
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.wishlist, "Wishlist item quantity updated")
    );
});

//purpose: remove item from wishlist using params
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { itemName } = req.params;

  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter((item) => item.name !== itemName);
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.wishlist, "Item removed from wishlist successfully")
    );
});