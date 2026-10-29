// Purpose: Order & Cart Logic (Create, List, Update, Cancel)
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

//purpose: create a new order
export const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  // Step 1: Validate items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one cake item");
  }

  // Step 2: Calculate total amount automatically
  const totalAmount = items.reduce((acc, item) => {
    return acc + (item.price || 0) * (item.quantity || 1);
  }, 0);

  // Step 3: Create order bound to req.user._id
  const order = await Order.create({
    userId: req.user._id,
    items,
    totalAmount,
    status: "Pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully!"));
});

//purpose : get all orders for the currently authenticated user in order of creation date from latest to oldest
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({
    createdAt: -1,//descending order i.e latest to oldest
  });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

//purpose: update quantity of a specific cake inside an order
export const updateOrderItemQuantity = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { itemName, quantity } = req.body;

  if (!itemName || quantity === undefined || quantity < 1) {
    throw new ApiError(400, "Valid itemName and quantity (>= 1) are required");
  }

  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const item = order.items.find((i) => i.name === itemName);
  if (!item) {
    throw new ApiError(404, "Item not found in order");
  }

  // Update item quantity
  item.quantity = quantity;

  // Recalculate total amount
  order.totalAmount = order.items.reduce(
    (acc, curr) => acc+(curr.price || 0) * (curr.quantity || 1),
    0
  );

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order quantity updated successfully"));
});

//purpose: remove or cancel an order
export const removeOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOneAndDelete({
    _id: orderId,
    userId: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found or unauthorized to delete");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order removed successfully"));
});